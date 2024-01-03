import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { datadogRum } from "@datadog/browser-rum";
import { datadogLogs } from "@datadog/browser-logs";
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
  service: process.env.NEXT_PUBLIC_DD_SERVICE_NAME || "ci-test-visibility",
  forwardConsoleLogs: "all",
});

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID || "",
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN || "",
  site: "datadoghq.com",
  service: process.env.NEXT_PUBLIC_DD_SERVICE_NAME || "ci-test-visibility",
  env: process.env.NEXT_PUBLIC_DD_ENV || "development",
  version: process.env.NEXT_PUBLIC_DD_VERSION || "1.0.0",
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  allowedTracingOrigins: [/https:\/\/.*\.env.play.instruqt\.com/],
  defaultPrivacyLevel: "mask-user-input",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
