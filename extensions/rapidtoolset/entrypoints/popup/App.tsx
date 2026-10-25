import ExtensionHeader from "@/components/ExtensionHeader";
import PopupContainer from "@/components/PopupContainer";
import OpenToolsSetting from "../../components/OpenToolsSetting";
import RapidToolSetView from "../../components/RapidToolSetView";
import { useOpenToolsIn } from "../../lib/useOpenToolsIn";

// Browsers let popups grow to 800×600: the full height, and a width past Bootstrap's 576 px "sm"
// breakpoint, so tools opened in the popup get their wider small-screen layouts
const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 600;

export default function App() {
  const [openToolsIn, setOpenToolsIn] = useOpenToolsIn();

  return (
    <PopupContainer
      width={POPUP_WIDTH}
      height={POPUP_HEIGHT}
      fixedHeight
      className="d-flex flex-column"
    >
      <ExtensionHeader
        settings={(close) => (
          <OpenToolsSetting
            value={openToolsIn}
            onChange={(value) => {
              setOpenToolsIn(value);
              close();
            }}
          />
        )}
      />
      <RapidToolSetView openToolsIn={openToolsIn} />
    </PopupContainer>
  );
}
