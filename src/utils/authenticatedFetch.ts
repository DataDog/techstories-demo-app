import { GoogleAuth } from 'google-auth-library';

// Cache for auth clients to avoid recreating them
const authClients = new Map<string, any>();

/**
 * Makes authenticated HTTP requests to internal Cloud Run services
 * Uses Google Cloud service account identity for authentication
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // For local development, fall back to regular fetch unless FORCE_AUTH is set
  if (process.env.NODE_ENV !== 'production' && !process.env.FORCE_AUTH) {
    console.log('Development mode - using unauthenticated fetch');
    return fetch(url, options);
  }

  try {
    // Extract base URL to use as cache key
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Get or create cached auth client for this service
    let authClient = authClients.get(baseUrl);
    if (!authClient) {
      const auth = new GoogleAuth();
      authClient = await auth.getIdTokenClient(baseUrl);
      authClients.set(baseUrl, authClient);
    }

    // Make authenticated request
    const response = await authClient.request({
      url,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
    });

    // Convert Google Auth Library response to standard Response object
    return new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as any),
    });
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw new Error(`Failed to make authenticated request to ${url}: ${error.message}`);
  }
}

/**
 * Helper for making authenticated JSON requests
 */
export async function authenticatedFetchJson(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await authenticatedFetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}