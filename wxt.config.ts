import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "wxt";
import manifest from "./extensions/rapidtoolset/manifest.config";

const root = import.meta.dirname;
const supportedLocales = new Set(["en", "ru"]);

function getBrowserLocaleConfig() {
  const locale = process.env.WXT_RAPIDTOOLSET_LOCALE?.toLowerCase();
  if (!locale || !supportedLocales.has(locale)) return {};

  return locale === "ru"
    ? {
        chromiumArgs: ["--lang=ru"],
        firefoxPref: {
          "intl.locale.requested": "ru",
        },
      }
    : {
        chromiumArgs: ["--lang=en"],
        firefoxPref: {
          "intl.locale.requested": "en",
        },
      };
}

export default defineConfig({
  srcDir: "src",
  entrypointsDir: path.resolve(
    root,
    "extensions",
    "rapidtoolset",
    "entrypoints",
  ),
  publicDir: "extensions/rapidtoolset/public",
  outDir: ".output",
  imports: false,
  webExt: getBrowserLocaleConfig(),
  manifest: (env) => {
    if (env.browser === "firefox") {
      return {
        ...manifest,
        browser_specific_settings: {
          gecko: {
            id: "{0e5c6f70-25d7-460c-8d36-5575129a8d8b}",
            data_collection_permissions: {
              required: ["none"],
            },
          },
        },
      };
    }
    if (env.browser === "chrome") {
      return {
        ...manifest,
        key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxMSAHMc7yOsHQXRknwr5ZVwF9KPBLJ5rSAR2+AQjjQAP+kISx+ydAtM05dfHWNh+bQNKYrfToAFYcwAlGi3gD/9hehSj7kKLjb5EV0LzV4dvkFPslbfear6O3fVSVo/wZrsxm3p8qv5TVWvbTWxGFSAe/r/02xnuPc5UhTKFixkQjBdXVxSNb9pjYnYzn04MxWQi2mToQKihL23sLnQZkgyXflbeIiy9B4x1q5VzgxUL0hImwAddIa09sZlZ4IN/+K5TVSh2geoijIn1548haYj7SWe9qhNH+mlj5LVqhLUN4tVGcsGuh7gWZZId1i9aDgDF3EmzEXyEwrB6zxlx2wIDAQAB",
      };
    }
    return manifest;
  },
  zip: {
    name: "rapidtoolset",
    artifactTemplate: "rapidtoolset-{{version}}-{{browser}}.zip",
  },
  vite: () => ({
    plugins: [tailwindcss(), react()],
  }),
});
