import styles from './style.module.css';

const LoadingSpinner = ({ size = 'medium', text = 'Загрузка...', fullScreen = false }) => {
    const sizeClass = size === 'small' ? styles.small : 
                     size === 'large' ? styles.large : 
                     styles.medium;

    const containerClass = fullScreen ? styles.fullScreen : styles.container;

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
