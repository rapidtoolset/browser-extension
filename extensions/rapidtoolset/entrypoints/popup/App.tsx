import ExtensionHeader from "@/components/ExtensionHeader";
import PopupContainer from "@/components/PopupContainer";
import RapidToolSetView from "../../components/RapidToolSetView";

export default function App() {
  return (
    <PopupContainer height={600} fixedHeight className="flex flex-col">
      <ExtensionHeader />
      <RapidToolSetView />
    </PopupContainer>
  );
}
