import React from 'react';
import NotificationsComponent from '../../components/NotificationsComponent';
import styles from './style.module.css';

const NotificationsPage = () => {
    return (
        <div className={styles.notifications_page}>
            <NotificationsComponent />
        </div>
    );
};

export default NotificationsPage;
