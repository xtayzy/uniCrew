import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner";
import styles from "./style.module.css";
import { GlobalLoadingContext, useGlobalLoading } from "./context";

export { useGlobalLoading };

export const GlobalLoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("Загрузка...");

    const showLoading = (text = "Загрузка...") => {
        setLoadingText(text);
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
    };

    const value = {
        isLoading,
        loadingText,
        showLoading,
        hideLoading
    };

    return (
        <GlobalLoadingContext.Provider value={value}>
            {children}
            {isLoading && (
                <>
                    <div className={styles.globalLoadingPlaceholder}></div>
                    <div className={styles.globalLoadingOverlay}>
                        <LoadingSpinner size="large" text={loadingText} fullScreen={false} />
                    </div>
                </>
            )}
        </GlobalLoadingContext.Provider>
    );
};
