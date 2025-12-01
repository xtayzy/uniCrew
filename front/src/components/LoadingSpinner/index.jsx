import { useEffect } from 'react';
import styles from './style.module.css';

const LoadingSpinner = ({ size = 'medium', text = 'Загрузка...', fullScreen = true }) => {
    const sizeClass = size === 'small' ? styles.small : 
                     size === 'large' ? styles.large : 
                     styles.medium;

    const containerClass = fullScreen ? styles.fullScreen : styles.container;

    useEffect(() => {
        if (fullScreen) {
            document.body.classList.add('loading-fullscreen');
            return () => {
                document.body.classList.remove('loading-fullscreen');
            };
        }
    }, [fullScreen]);

    if (fullScreen) {
        return (
            <div className={containerClass}>
                <div className={styles.spinnerContainer}>
                    <div className={`${styles.spinner} ${sizeClass}`}></div>
                </div>
                {text && <p className={styles.text}>{text}</p>}
            </div>
        );
    }

    return (
        <div className={containerClass}>
            <div className={styles.spinnerContainer}>
                <div className={`${styles.spinner} ${sizeClass}`}></div>
            </div>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
