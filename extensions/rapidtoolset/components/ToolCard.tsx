import { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { DEFAULT_FONT_WEIGHT } from "@/lib/constants";
import { t } from "../lib/i18n";
import type { Tool } from "../lib/types";

interface Props {
  tool: Tool;
  bookmarked: boolean;
  onToggleBookmark: (tool: Tool) => void;
}

export default function ToolCard(props: Props) {
  const { tool, bookmarked, onToggleBookmark } = props;
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const checkClamp = useCallback(() => {
    const el = descRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    checkClamp();
  }, [tool.description, checkClamp]);

  return (
    <div className="bg-body-tertiary rounded d-flex align-items-start gap-2 p-3 flex-shrink-0">
      <div className="min-w-0 flex-grow-1">
        {/* Balancing applies to the block around the (inline) link */}
        <div className="text-balance">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-reset text-dark-emphasis text-uppercase"
            style={{
              fontWeight: DEFAULT_FONT_WEIGHT,
              overflowWrap: "anywhere",
            }}
          >
            {tool.name}
          </a>
        </div>
        <p
          ref={descRef}
          className={classNames("text-muted small text-balance mt-1 mb-0", {
            "line-clamp-2": !expanded,
          })}
        >
          {tool.description}
        </p>
        {(clamped || expanded) && (
          // .btn-reset inherits its font, so the wrapper sets the size
          <div className="small mt-1">
            <button
              type="button"
              className="btn-reset content-link fw-medium"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? t("showLess") : t("showMore")}
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        className={classNames(
          "btn-reset btn-bookmark p-2 rounded flex-shrink-0 d-inline-flex",
          { "text-body-tertiary": !bookmarked },
        )}
        style={bookmarked ? { color: "var(--bs-primary)" } : undefined}
        aria-label={bookmarked ? t("removeBookmark") : t("addBookmark")}
        onClick={() => onToggleBookmark(tool)}
      >
        <BookmarkIcon sx={{ fontSize: 24 }} />
      </button>
    </div>
  );
}
