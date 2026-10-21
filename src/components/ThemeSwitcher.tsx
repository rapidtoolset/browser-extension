import classNames from "classnames";
import type { SvgIconComponent } from "@mui/icons-material";
import BrightnessAutoOutlinedIcon from "@mui/icons-material/BrightnessAutoOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import HeaderDropdown from "@/components/HeaderDropdown";
import { useTheme, type ThemePreference } from "@/lib/useTheme";

const themeOptions: {
  value: ThemePreference;
  label: string;
  Icon: SvgIconComponent;
}[] = [
  { value: "light", label: "Light", Icon: WbSunnyOutlinedIcon },
  { value: "dark", label: "Dark", Icon: DarkModeOutlinedIcon },
  { value: "system", label: "System", Icon: BrightnessAutoOutlinedIcon },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const current =
    themeOptions.find((option) => option.value === theme) ??
    themeOptions[themeOptions.length - 1];

  return (
    <HeaderDropdown
      triggerContent={<current.Icon />}
      ariaLabel={`Theme: ${current.label}`}
    >
      {(close) =>
        themeOptions.map(({ value, label, Icon }) => (
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
              {label}
            </button>
          </li>
        ))
      }
    </HeaderDropdown>
  );
}
