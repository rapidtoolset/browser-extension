import { useState } from "react";
import classNames from "classnames";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Spinner from "@/components/Spinner";
import { DEFAULT_FONT_WEIGHT } from "@/lib/constants";
import BookmarkButton from "./BookmarkButton";
import PopupCloseWarning from "./PopupCloseWarning";
import { getLocale, t } from "../lib/i18n";
import { getEmbedUrl } from "../lib/sync";
import type { Tool } from "../lib/types";

/**
 * Features a cross-origin iframe only gets when allowed, which RapidToolSet's
 * tools use: copy and paste buttons, camera and microphone, screen capture,
 * location, full screen and keeping the screen on.
 */
const EMBED_ALLOW = [
  "clipboard-read",
  "clipboard-write",
  "camera",
  "microphone",
  "display-capture",
  "geolocation",
  "fullscreen",
  "screen-wake-lock",
].join("; ");

/** The popup's own padding (Bootstrap's p-3), for the embed page to put around the tool */
const EMBED_PADDING = 16;

interface Props {
  tool: Tool;
  bookmarked: boolean;
  onToggleBookmark: (tool: Tool) => void;
  onBack: () => void;
  /** Whether to warn that closing the popup loses what was entered in the tool */
  warn: boolean;
  /** Turns the warning off for good */
  onHideWarning: () => void;
}

/**
 * A tool opened inside the popup: a bar with its name and actions above the
 * tool's embed page. The embed follows the popup's theme: the iframe inherits
 * the popup's `color-scheme`, which browsers report to the page inside it as
 * its `prefers-color-scheme`.
 */
export default function ToolView(props: Props) {
  const { tool, bookmarked, onToggleBookmark, onBack, warn, onHideWarning } =
    props;
  const [loading, setLoading] = useState(true);

  return (
    <div className="d-flex flex-column flex-grow-1 min-h-0">
      <div className="d-flex align-items-center gap-1 px-2 py-1 border-bottom flex-shrink-0">
        <button
          type="button"
          className="btn-reset btn-bookmark p-2 rounded flex-shrink-0 d-inline-flex text-body-secondary"
          aria-label={t("back")}
          onClick={onBack}
        >
          <ArrowBackIcon className="flip-rtl" sx={{ fontSize: 24 }} />
        </button>
        <h1
          className="h6 mb-0 flex-grow-1 min-w-0 text-truncate text-dark-emphasis text-uppercase"
          style={{ fontWeight: DEFAULT_FONT_WEIGHT }}
        >
          {tool.name}
        </h1>
        <BookmarkButton
          bookmarked={bookmarked}
          onToggle={() => onToggleBookmark(tool)}
          outlined
        />
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-reset btn-bookmark p-2 rounded flex-shrink-0 d-inline-flex text-body-tertiary"
          aria-label={t("openInNewTab")}
        >
          <OpenInNewIcon sx={{ fontSize: 24 }} />
        </a>
      </div>

      {warn && (
        <PopupCloseWarning toolUrl={tool.url} onHideForGood={onHideWarning} />
      )}

      <div className="position-relative flex-grow-1 min-h-0">
        {loading && (
          <div className="position-absolute top-0 start-0 w-100 d-flex align-items-center justify-content-center gap-2 py-4 text-body-secondary">
            <Spinner size="sm" />
            {t("statusLoading")}
          </div>
        )}
        <iframe
          src={getEmbedUrl(tool, getLocale(), EMBED_PADDING)}
          title={tool.name}
          allow={EMBED_ALLOW}
          className={classNames("d-block w-100 h-100 border-0", {
            invisible: loading,
          })}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
