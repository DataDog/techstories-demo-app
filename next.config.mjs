/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
import removeImports from "next-remove-imports";

/** @type {function(import("next").NextConfig): import("next").NextConfig}} */
const removeImportsFun = removeImports({});

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  transpilePackages: ["next-auth"],
  webpack(config) {
    config.externals.push(
      "@datadog/native-metrics",
      "@datadog/pprof",
      "@datadog/native-appsec",
      "@datadog/native-iast-taint-tracking",
      "@datadog/wasm-js-rewriter",
    );
    return config;
  },
};

export default removeImportsFun(config);
