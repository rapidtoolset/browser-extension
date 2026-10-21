import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/index.css";
import App from "./App.tsx";
import "./index.css";
import { getLocale, loadDateFnsLocale } from "../../lib/i18n";
import { isRtlLocale } from "../../lib/locales";

config.autoAddCss = false;

const locale = getLocale();
const rtl = isRtlLocale(locale);
document.documentElement.lang = locale;
document.documentElement.dir = rtl ? "rtl" : "ltr";

// Load what depends on the language before rendering. Bootstrap mirrors its
// layout in a separate right-to-left build, so only the build for this
// direction is loaded, ahead of the stylesheets above so they can override it.
const [{ default: bootstrapCss }] = await Promise.all([
  rtl
    ? import("bootstrap/dist/css/bootstrap.rtl.css?inline")
    : import("bootstrap/dist/css/bootstrap.css?inline"),
  loadDateFnsLocale(),
]);
const bootstrapStyle = document.createElement("style");
bootstrapStyle.textContent = bootstrapCss;
document.head.prepend(bootstrapStyle);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
