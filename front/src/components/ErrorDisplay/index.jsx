import React from 'react';
import styles from './style.module.css';
import { AlertCircle, RefreshCw, Home, X } from 'lucide-react';

const ErrorDisplay = ({ 
    error, 
    title = 'Произошла ошибка', 
    onRetry, 
    onClose,
    showClose = true,
    fullScreen = false 
}) => {
    const getErrorMessage = () => {
        if (!error) return 'Неизвестная ошибка';
        
        if (typeof error === 'string') return error;
        
        // Обработка сетевых ошибок
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            return 'Не удалось подключиться к серверу. Проверьте подключение к интернету и убедитесь, что сервер запущен.';
        }
        
        if (error.code === 'ERR_CONNECTION_REFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
            return 'Сервер недоступен. Убедитесь, что сервер запущен и работает на порту 8000.';
        }
        
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return 'Превышено время ожидания ответа от сервера. Попробуйте позже.';
        }
        
        if (error.response?.data) {
            const data = error.response.data;
            if (data.detail) return data.detail;
            if (data.message) return data.message;
            if (typeof data === 'string') return data;
            if (Array.isArray(data)) {
                return data.map(err => 
                    typeof err === 'string' ? err : err.message || JSON.stringify(err)
                ).join(', ');
            }
            if (typeof data === 'object') {
                const firstKey = Object.keys(data)[0];
                const firstValue = data[firstKey];
                if (Array.isArray(firstValue)) {
                    return `${firstKey}: ${firstValue.join(', ')}`;
                }
                return `${firstKey}: ${firstValue}`;
            }
        }
        
        if (error.message) return error.message;
        
        return 'Произошла неизвестная ошибка';
    };

    const getErrorCode = () => {
        if (error?.response?.status) {
            return error.response.status;
        }
        return null;
    };

    const getErrorTitle = () => {
        // Обработка сетевых ошибок
        if (error?.code === 'ERR_NETWORK' || error?.code === 'ERR_CONNECTION_REFUSED' || error?.message === 'Network Error') {
            return 'Ошибка подключения';
        }
        
        const code = getErrorCode();
        if (code === 404) return 'Страница не найдена';
        if (code === 403) return 'Доступ запрещен';
        if (code === 401) return 'Необходима авторизация';
        if (code === 500) return 'Ошибка сервера';
        if (code === 400) return 'Неверный запрос';
        if (code >= 500) return 'Ошибка сервера';
        if (code >= 400) return 'Ошибка запроса';
        return title;
    };

    const containerClass = fullScreen ? styles.fullScreen : styles.container;

    return (
        <div className={containerClass}>
            <div className={styles.errorCard}>
                {showClose && onClose && (
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                )}
                
                <div className={styles.errorIcon}>
                    <AlertCircle size={64} />
                </div>
                
                <h1 className={styles.errorTitle}>{getErrorTitle()}</h1>
                
                {getErrorCode() && (
                    <div className={styles.errorCode}>
                        Код ошибки: {getErrorCode()}
                    </div>
                )}
                
                <p className={styles.errorMessage}>
                    {getErrorMessage()}
                </p>
                
                <div className={styles.errorActions}>
                    {onRetry && (
                        <button 
                            className={styles.retryButton} 
                            onClick={onRetry}
                        >
                            <RefreshCw size={18} />
                            <span>Попробовать снова</span>
                        </button>
                    )}
                    
                    <button 
                        className={styles.homeButton} 
                        onClick={() => window.location.href = '/'}
                    >
                        <Home size={18} />
                        <span>На главную</span>
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default ErrorDisplay;
