import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

import { handlers } from "~/server/auth";

function toRequestBody(req: NextApiRequest): string | undefined {
  if (req.method === "GET" || req.method === "HEAD" || !req.body) {
    return undefined;
  }

  if (typeof req.body === "string") {
    return req.body;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.body)) {
    if (value != null) {
      params.append(key, String(value));
    }
  }
  return params.toString();
}

export default async function authHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const handler = req.method === "GET" ? handlers.GET : handlers.POST;
  const protocol =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? "http";
  const host = req.headers.host ?? "localhost:3000";
  const url = `${protocol}://${host}${req.url ?? ""}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
    }
  }

  const body = toRequestBody(req);
  if (body) {
    headers.set("content-type", "application/x-www-form-urlencoded");
  }

  const request = new NextRequest(url, {
    method: req.method,
    headers,
    body,
  });
  const response = await handler(request);

  res.status(response.status);

  const setCookies = response.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    res.appendHeader("Set-Cookie", cookie);
  }

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }
    res.setHeader(key, value);
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}
