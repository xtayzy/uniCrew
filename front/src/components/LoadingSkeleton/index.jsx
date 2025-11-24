import styles from './style.module.css';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={styles.skeletonCard}>
                        <div className={styles.skeletonLine} style={{ width: '60%', height: '20px' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '40%', height: '16px', marginTop: '8px' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '80%', height: '14px', marginTop: '12px' }}></div>
                        <div className={styles.skeletonTags}>
                            <div className={styles.skeletonTag}></div>
                            <div className={styles.skeletonTag}></div>
                            <div className={styles.skeletonTag}></div>
                        </div>
                    </div>
                );
            case 'user-card':
                return (
                    <div className={styles.skeletonUserCard}>
                        <div className={styles.skeletonLine} style={{ width: '70%', height: '18px' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '50%', height: '14px', marginTop: '6px' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '60%', height: '14px', marginTop: '8px' }}></div>
                        <div className={styles.skeletonTags}>
                            <div className={styles.skeletonTag}></div>
                            <div className={styles.skeletonTag}></div>
                        </div>
                    </div>
                );
            case 'team-card':
                return (
                    <div className={styles.skeletonTeamCard}>
                        <div className={styles.skeletonLine} style={{ width: '80%', height: '22px' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '100%', height: '16px', marginTop: '8px' }}></div>
                        <div className={styles.skeletonLine} style={{ width: '60%', height: '14px', marginTop: '12px' }}></div>
                        <div className={styles.skeletonTags}>
                            <div className={styles.skeletonTag}></div>
                            <div className={styles.skeletonTag}></div>
                            <div className={styles.skeletonTag}></div>
                        </div>
                        <div className={styles.skeletonLine} style={{ width: '40%', height: '12px', marginTop: '16px' }}></div>
                    </div>
                );
            default:
                return <div className={styles.skeletonLine}></div>;
        }
    };

    return (
        <div className={styles.skeletonContainer}>
            {Array.from({ length: count }, (_, index) => (
                <div key={index}>
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
