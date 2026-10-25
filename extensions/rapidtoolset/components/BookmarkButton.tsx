import classNames from "classnames";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import { t } from "../lib/i18n";

interface Props {
  bookmarked: boolean;
  onToggle: () => void;
  /**
   * Shows an outline bookmark while the tool isn't bookmarked, to match the
   * line icons around it (the tool view's bar)
   */
  outlined?: boolean;
}

/** Bookmark toggle of a tool, in the accent color while the tool is bookmarked. */
export default function BookmarkButton({
  bookmarked,
  onToggle,
  outlined = false,
}: Props) {
  const Icon =
    outlined && !bookmarked ? BookmarkBorderOutlinedIcon : BookmarkIcon;

  return (
    <button
      type="button"
      className={classNames(
        "btn-reset btn-bookmark p-2 rounded flex-shrink-0 d-inline-flex",
        { "text-body-tertiary": !bookmarked },
      )}
      style={bookmarked ? { color: "var(--bs-primary)" } : undefined}
      aria-label={bookmarked ? t("removeBookmark") : t("addBookmark")}
      onClick={onToggle}
    >
      <Icon sx={{ fontSize: 24 }} />
    </button>
  );
}
