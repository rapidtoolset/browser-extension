import { spawn } from "node:child_process";

const supportedLocales = new Set(["en", "ru"]);
const argv = process.argv.slice(2);
const localeFlagIndex = argv.indexOf("--locale");
const locale = localeFlagIndex >= 0 ? argv[localeFlagIndex + 1] : undefined;
const args =
  localeFlagIndex >= 0
    ? argv.filter(
        (_, index) =>
          index !== localeFlagIndex && index !== localeFlagIndex + 1,
      )
    : argv.filter((arg) => !supportedLocales.has(arg));

if (localeFlagIndex >= 0 && (!locale || !supportedLocales.has(locale))) {
  console.error("Usage: npm run dev -- --locale <en|ru> [wxt args...]");
  process.exit(1);
}

const activeLocale = locale ?? argv.find((arg) => supportedLocales.has(arg));

const child = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["exec", "wxt", "--", ...args],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      ...(activeLocale ? { WXT_RAPIDTOOLSET_LOCALE: activeLocale } : {}),
    },
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
