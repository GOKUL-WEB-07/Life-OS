import { createContext, useContext } from "react";
import type { AppData, CollectionName, Input } from "../../types/models";
type DataState = {
  data: AppData;
  loading: boolean;
  error: string;
  retry: () => void;
  saveItem: <K extends CollectionName>(
    type: K,
    input: Input<K>,
    id?: string,
    source?: string,
  ) => Promise<string>;
  deleteItem: (type: CollectionName, id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
};
export const DataContext = createContext<DataState>(null!);

export const useData = () => useContext(DataContext);
