import { useEffect } from "react";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { datadogRum } from "@datadog/browser-rum";
import { datadogLogs } from "@datadog/browser-logs";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || "",
  site: "datadoghq.com",
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
  env: process.env.NEXT_PUBLIC_DD_ENV || "development",
  service: process.env.NEXT_PUBLIC_DD_SERVICE_NAME || "techstories-web",
  forwardConsoleLogs: "all",
});

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID || "",
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || "",
  site: "datadoghq.com",
  service: process.env.NEXT_PUBLIC_DD_SERVICE_NAME || "techstories-web",
  env: process.env.NEXT_PUBLIC_DD_ENV || "development",
  version: process.env.NEXT_PUBLIC_DD_VERSION || "1.0.0",
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  silentMultipleInit: true,
  defaultPrivacyLevel: "mask",
  allowedTracingUrls: [
    {
      match: /https:\/\/.*\.env.play.instruqt\.com/,
      propagatorTypes: ["tracecontext", "datadog", "b3", "b3multi"],
    },
    {
      match: /^http:\/\/localhost(:\d+)?$/,
      propagatorTypes: ["tracecontext", "datadog", "b3", "b3multi"],
    },
    {
      match: /.*/,
      propagatorTypes: ["tracecontext", "datadog", "b3", "b3multi"],
    },
  ],
  traceSampleRate: 100,
  allowUntrustedEvents: true,
});

const SessionWatcher = () => {
  const { data: sessionData } = useSession();
  useEffect(() => {
    if (sessionData) {
      // check if user is already set
      if (datadogRum.getUser().id) {
        console.log("User already set");
        return;
      }

      datadogRum.setUser({
        id: sessionData.user.id,
        name: sessionData.user.name,
        email: sessionData.user.email,
      });
    }
  }, [sessionData]);

  return null;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <SessionWatcher />
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
