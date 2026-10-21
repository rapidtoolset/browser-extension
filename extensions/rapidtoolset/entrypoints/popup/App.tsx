import ExtensionHeader from "@/components/ExtensionHeader";
import PopupContainer from "@/components/PopupContainer";
import RapidToolSetView from "../../components/RapidToolSetView";

export default function App() {
  return (
    <PopupContainer height={600} fixedHeight className="d-flex flex-column">
      <ExtensionHeader />
      <RapidToolSetView />
    </PopupContainer>
  );
}
