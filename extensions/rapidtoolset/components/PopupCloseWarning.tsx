import { t } from "../lib/i18n";

interface Props {
  /** The tool's page on the website, which the warning links to */
  toolUrl: string;
  /** Hides the warning for good */
  onHideForGood: () => void;
}

/**
 * Warning above a tool opened in the popup: the popup closes as soon as it
 * loses focus, and the tool's page goes with it, along with whatever was
 * entered in it. It links to the tool in a new tab, which keeps the data.
 */
export default function PopupCloseWarning({ toolUrl, onHideForGood }: Props) {
  const linkText = t("popupCloseWarningLink");
  // The translation decides where the link goes in the sentence
  const [before, after] = t("popupCloseWarning", linkText).split(linkText);

  return (
    <div className="alert alert-warning m-3 mb-0 p-3 border-0 small flex-shrink-0">
      <p className="mb-2 text-balance">
        {before}
        <a
          href={toolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link-reset fw-semibold text-decoration-underline"
        >
          {linkText}
        </a>
        {after}
      </p>
      <button
        type="button"
        className="btn-reset fw-semibold text-decoration-underline"
        onClick={onHideForGood}
      >
        {t("dontShowAgain")}
      </button>
    </div>
  );
}
