import React, { createContext, useContext, type ReactNode } from "react";
import { useDataStore, type DataStore } from "../data/store";

const DataContext = createContext<DataStore | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const store = useDataStore();
    return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
};

export const useData = (): DataStore => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
