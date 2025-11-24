import { useState, useEffect } from 'react';
import styles from './style.module.css';

const PageTransition = ({ children, isLoading, loadingComponent, minHeight = '400px' }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Небольшая задержка для плавного появления контента
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isLoading]);

    return (
        <div 
            className={`${styles.pageContainer} ${isVisible ? styles.visible : ''}`}
            style={{ minHeight }}
        >
            {isLoading ? (
                loadingComponent || <div className={styles.defaultLoading}>Загрузка...</div>
            ) : (
                <div className={`${styles.content} ${isVisible ? styles.contentVisible : ''}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageTransition;
