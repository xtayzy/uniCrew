import { createContext, useContext, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import styles from './style.module.css';

const GlobalLoadingContext = createContext();

export const useGlobalLoading = () => {
    const context = useContext(GlobalLoadingContext);
    if (!context) {
        throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
    }
    return context;
};

export const GlobalLoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Загрузка...');

    const showLoading = (text = 'Загрузка...') => {
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
                <div className={styles.globalLoadingOverlay}>
                    <LoadingSpinner size="large" text={loadingText} />
                </div>
            )}
        </GlobalLoadingContext.Provider>
    );
};
