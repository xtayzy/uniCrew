import { useState, useCallback } from 'react';
import ErrorDisplay from '../components/ErrorDisplay';

export const useErrorHandler = () => {
    const [error, setError] = useState(null);

    const handleError = useCallback((err) => {
        console.error('Error caught:', err);
        setError(err);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const handleRetry = useCallback(() => {
        setError(null);
        window.location.reload();
    }, []);

    const ErrorComponent = error ? (
        <ErrorDisplay
            error={error}
            onRetry={handleRetry}
            onClose={clearError}
            fullScreen={true}
        />
    ) : null;

    return {
        error,
        handleError,
        clearError,
        ErrorComponent
    };
};

export default useErrorHandler;
