import { useCallback, useEffect, useState } from "react";
import { loadOpenToolsIn, saveOpenToolsIn } from "./storage";
import type { OpenToolsIn } from "./types";

/** The "open tools" setting: where a click on a tool opens it, a new tab by default. */
export function useOpenToolsIn() {
  const [openToolsIn, _setOpenToolsIn] = useState<OpenToolsIn>("tab");

  useEffect(() => {
    loadOpenToolsIn().then(_setOpenToolsIn);
  }, []);

  const setOpenToolsIn = useCallback((value: OpenToolsIn) => {
    _setOpenToolsIn(value);
    saveOpenToolsIn(value);
  }, []);

  return [openToolsIn, setOpenToolsIn] as const;
}
