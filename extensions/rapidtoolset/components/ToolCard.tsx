import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import classNames from "classnames";
import { DEFAULT_FONT_WEIGHT } from "@/lib/constants";
import BookmarkButton from "./BookmarkButton";
import { t } from "../lib/i18n";
import type { Tool } from "../lib/types";

interface Props {
  tool: Tool;
  bookmarked: boolean;
  onToggleBookmark: (tool: Tool) => void;
  /** Opens the tool inside the popup. Without it, the tool's link opens the website in a new tab */
  onOpen?: (tool: Tool) => void;
}

function hasModifierKey(event: MouseEvent): boolean {
  return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
}

export default function ToolCard(props: Props) {
  const { tool, bookmarked, onToggleBookmark, onOpen } = props;
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
          {/* With onOpen, a click opens the tool in the popup. The link stays a real one, so a middle
              click or a click with a modifier key still does what it does on links (a new tab or window) */}
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              if (!onOpen || hasModifierKey(event)) return;
              event.preventDefault();
              onOpen(tool);
            }}
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
      <BookmarkButton
        bookmarked={bookmarked}
        onToggle={() => onToggleBookmark(tool)}
      />
    </div>
  );
}
