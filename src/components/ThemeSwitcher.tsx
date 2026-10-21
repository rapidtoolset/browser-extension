import classNames from "classnames";
import type { SvgIconComponent } from "@mui/icons-material";
import BrightnessAutoOutlinedIcon from "@mui/icons-material/BrightnessAutoOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
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

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const current =
    themeOptions.find((option) => option.value === theme) ??
    themeOptions[themeOptions.length - 1];

  return (
    <HeaderDropdown
      triggerContent={<current.Icon />}
      ariaLabel={t("themeAriaLabel", t(current.labelKey))}
    >
      {(close) =>
        themeOptions.map(({ value, labelKey, Icon }) => (
          <li key={value} role="none">
            <button
              type="button"
              role="menuitem"
              className={classNames(
                "dropdown-item d-flex align-items-center gap-2",
                { active: theme === value },
              )}
              onClick={() => {
                setTheme(value);
                close();
              }}
            >
              <Icon fontSize="small" className="text-body-secondary" />
              {t(labelKey)}
            </button>
          </li>
        ))
      }
    </HeaderDropdown>
  );
}
