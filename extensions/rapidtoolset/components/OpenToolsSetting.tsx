import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import WebAssetOutlinedIcon from "@mui/icons-material/WebAssetOutlined";
import { SettingsGroup, SettingsOption } from "@/components/SettingsMenu";
import { t } from "../lib/i18n";
import type { OpenToolsIn } from "../lib/types";

const options = [
  { value: "tab", labelKey: "openToolsInTab", Icon: OpenInNewOutlinedIcon },
  { value: "popup", labelKey: "openToolsInPopup", Icon: WebAssetOutlinedIcon },
] as const;

interface Props {
  value: OpenToolsIn;
  onChange: (value: OpenToolsIn) => void;
}

/** Settings menu group choosing where a click on a tool opens it. */
export default function OpenToolsSetting({ value, onChange }: Props) {
  return (
    <SettingsGroup label={t("settingsOpenTools")}>
      {options.map((option) => (
        <SettingsOption
          key={option.value}
          checked={value === option.value}
          Icon={option.Icon}
          onSelect={() => onChange(option.value)}
        >
          {t(option.labelKey)}
        </SettingsOption>
      ))}
    </SettingsGroup>
  );
}
