import { browser } from "wxt/browser";
import BrandIcon from "@/components/BrandIcon";
import SettingsMenu, {
  type SettingsMenuProps,
} from "@/components/SettingsMenu";
import { t } from "@/lib/i18n";

const SITE = "rapidtoolset.com";

interface ExtensionHeaderProps {
  /** Override the extension name (defaults to manifest name) */
  name?: string;
  /** Developer / company name shown in the header */
  developer?: string;
  /** The extension's own settings, shown in the settings menu after the theme */
  settings?: SettingsMenuProps["children"];
}

/** Popup header, styled like the website's navbar: brand on the left, controls on the right. */
export default function ExtensionHeader(props: ExtensionHeaderProps) {
  const manifest = browser.runtime.getManifest();
  const name = props.name ?? manifest.name ?? "Extension";
  // The translation decides where the site goes ("by X", "X tarafından")
  const [bylineStart, bylineEnd] = t("headerByline", SITE).split(SITE);

  return (
    <header className="extension-header bg-body-tertiary shadow d-flex align-items-center gap-3 px-3">
      {/* The bolt is centred on both lines, a little shorter than they are (33 px from the name's
          capitals to the byline's baseline in common system fonts). Same 0.75rem gap as the
          website's header */}
      <div
        className="d-flex align-items-center min-w-0"
        style={{ gap: "0.75rem" }}
      >
        <span className="text-dark-emphasis d-flex">
          <BrandIcon size={30} />
        </span>
        <div className="d-flex flex-column gap-1 min-w-0">
          {/* The English brand name stays "RAPIDTOOLSET" when uppercased,
              where Turkish rules would make it "RAPİDTOOLSET" */}
          <span
            lang="en"
            className="extension-header-name h5 mb-0 text-dark-emphasis text-truncate"
          >
            {name}
          </span>
          <span className="small lh-1 text-body-tertiary text-truncate">
            {bylineStart}
            <a
              href={`https://${SITE}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-secondary text-decoration-none"
            >
              {SITE}
            </a>
            {bylineEnd}
          </span>
        </div>
      </div>

      <div className="ms-auto">
        <SettingsMenu>{props.settings}</SettingsMenu>
      </div>
    </header>
  );
}
