import { createContext, useContext } from "react";
import type { CollectionName } from "../types/models";
export type EditorRequest = {
  type: CollectionName;
  id?: string;
  initial?: Record<string, unknown>;
  source?: string;
};
export const EditorContext = createContext<(request: EditorRequest) => void>(
  () => {},
);
export const useEditor = () => useContext(EditorContext);
