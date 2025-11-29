import { useState, useEffect } from "react";
import LoadingSpinner from "../LoadingSpinner";
import styles from "./style.module.css";
import { GlobalLoadingContext } from "./context";

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

    useEffect(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            if (isLoading) {
                const placeholder = document.createElement('div');
                placeholder.className = styles.globalLoadingPlaceholder;
                placeholder.id = 'loading-placeholder';
                mainContent.appendChild(placeholder);
            } else {
                const placeholder = document.getElementById('loading-placeholder');
                if (placeholder) {
                    placeholder.remove();
                }
            }
        }
        return () => {
            const placeholder = document.getElementById('loading-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
        };
    }, [isLoading]);

    return (
        <GlobalLoadingContext.Provider value={value}>
            {children}
            {isLoading && (
                <div className={styles.globalLoadingOverlay}>
                    <LoadingSpinner size="large" text={loadingText} />
                </div>
            )}
        </GlobalLoadingContext.Provider>
    );
};
