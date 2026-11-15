/**
 * Set GITHUB_PAGES=true to produce a static export for GitHub Pages
 * (served from https://<user>.github.io/<repo>/). The Remotion Lambda API
 * routes are server-only and are not part of the static build.
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? process.env.NEXT_PUBLIC_BASE_PATH ?? "/story" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(isGithubPages && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  webpack: (config, { webpack, isServer, nextRuntime }) => {
    // Workaround for the following issue:
    // https://github.com/aws-amplify/amplify-js/issues/11030#issuecomment-1598207365

    // Avoid AWS SDK Node.js require issue
    if (isServer && nextRuntime === "nodejs")
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^aws-crt$/ }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^@aws-sdk\/signature-v4-crt$/,
        })
      );
    return config;
  },
};

module.exports = nextConfig;
