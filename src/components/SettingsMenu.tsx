import type { ReactNode } from "react";
import classNames from "classnames";
import type { SvgIconComponent } from "@mui/icons-material";
import BrightnessAutoOutlinedIcon from "@mui/icons-material/BrightnessAutoOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import HeaderDropdown from "@/components/HeaderDropdown";
import { t } from "@/lib/i18n";
import { useTheme, type ThemePreference } from "@/lib/useTheme";

const themeOptions: {
  value: ThemePreference;
  labelKey: "themeLight" | "themeDark" | "themeSystem";
  Icon: SvgIconComponent;
}[] = [
  { value: "light", labelKey: "themeLight", Icon: WbSunnyOutlinedIcon },
  { value: "dark", labelKey: "themeDark", Icon: DarkModeOutlinedIcon },
  {
    value: "system",
    labelKey: "themeSystem",
    Icon: BrightnessAutoOutlinedIcon,
  },
];

export interface SettingsMenuProps {
  /**
   * The extension's own settings (SettingsGroup elements), shown after the
   * theme. Receives a function closing the menu.
   */
  children?: (close: () => void) => ReactNode;
}

/** Header menu of the popup's settings: the color theme, then the extension's own. */
export default function SettingsMenu({ children }: SettingsMenuProps) {
  const { theme, setTheme } = useTheme();

  return (
    <HeaderDropdown
      triggerContent={<SettingsOutlinedIcon />}
      ariaLabel={t("settings")}
    >
      {(close) => (
        <>
          <SettingsGroup label={t("settingsTheme")}>
            {themeOptions.map(({ value, labelKey, Icon }) => (
              <SettingsOption
                key={value}
                checked={theme === value}
                Icon={Icon}
                onSelect={() => {
                  setTheme(value);
                  close();
                }}
              >
                {t(labelKey)}
              </SettingsOption>
            ))}
          </SettingsGroup>
          {children && (
            <>
              {/* With the headings' padding, this leaves as much space above
                  the line as below it, a little more than between options */}
              <li role="none">
                <hr
                  className="dropdown-divider"
                  style={{ margin: "0.75rem 0" }}
                />
              </li>
              {children(close)}
            </>
          )}
        </>
      )}
    </HeaderDropdown>
  );
}

interface SettingsGroupProps {
  label: string;
  /** SettingsOption elements */
  children: ReactNode;
}

/** A setting in the settings menu: a heading over its options. */
export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <li role="none">
      {/* Screen readers get the label from the group's aria-label. Half of Bootstrap's padding
          puts the heading as close to its options as they are to each other, and evens out the
          menu's top and bottom edges */}
      <div className="dropdown-header py-1" aria-hidden="true">
        {label}
      </div>
      <ul role="group" aria-label={label} className="list-unstyled mb-0">
        {children}
      </ul>
    </li>
  );
}

interface SettingsOptionProps {
  checked: boolean;
  Icon: SvgIconComponent;
  onSelect: () => void;
  children: ReactNode;
}

/** One of a setting's options, highlighted while it's the chosen one. */
export function SettingsOption({
  checked,
  Icon,
  onSelect,
  children,
}: SettingsOptionProps) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitemradio"
        aria-checked={checked}
        className={classNames("dropdown-item d-flex align-items-center gap-2", {
          active: checked,
        })}
        onClick={onSelect}
      >
        <Icon fontSize="small" className="text-body-secondary" />
        {children}
      </button>
    </li>
  );
}
