import { createContext, useContext } from "react";

export const GlobalLoadingContext = createContext();

export const useGlobalLoading = () => {
    const context = useContext(GlobalLoadingContext);
    if (!context) {
        throw new Error("useGlobalLoading must be used within a GlobalLoadingProvider");
    }
    return context;
};

