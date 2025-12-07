import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { API_URL } from "../../config.js";
import ErrorDisplay from "../ErrorDisplay";
import LoadingSpinner from "../LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

const NotificationsComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { tokens } = useAuth();
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        try {
            setError(null);
            const response = await axios.get(`${API_URL}users/notifications/`, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [tokens]);

    useEffect(() => {
        fetchNotifications();
        
        // Обновляем уведомления каждые 10 секунд
        const interval = setInterval(fetchNotifications, 10000);
        
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`${API_URL}users/mark_notification_read/`, {
                notification_id: notificationId,
            }, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, is_read: true }
                        : notif
                )
            );
            
            // Отправляем событие для обновления счетчика в Header
            window.dispatchEvent(new Event('notificationUpdated'));
        } catch (error) {
            console.error('Ошибка при отметке уведомления:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(`${API_URL}users/mark_all_notifications_read/`, {}, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, is_read: true }))
            );
            
            // Отправляем событие для обновления счетчика в Header
            window.dispatchEvent(new Event('notificationUpdated'));
        } catch (error) {
            console.error('Ошибка при отметке всех уведомлений:', error);
        }
    };

    const handleAcceptInvitation = async (teamMemberId) => {
        try {
            const response = await axios.post(`${API_URL}users/accept_invitation/`, {
                member_id: teamMemberId,
            }, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            
            // Обновляем уведомления после принятия приглашения
            fetchNotifications();
        } catch (error) {
            console.error('Ошибка при принятии приглашения:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при принятии приглашения');
            }
        }
    };

    const handleRejectInvitation = async (teamMemberId) => {
        try {
            const response = await axios.post(`${API_URL}users/reject_invitation/`, {
                member_id: teamMemberId,
            }, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            
            // Обновляем уведомления после отклонения приглашения
            fetchNotifications();
        } catch (error) {
            console.error('Ошибка при отклонении приглашения:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при отклонении приглашения');
            }
        }
    };

    const handleApproveRequest = async (teamId, memberId) => {
        try {
            const response = await axios.post(`${API_URL}teams/${teamId}/approve/`, {
                member_id: memberId,
            }, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            
            // Обновляем уведомления после принятия заявки
            fetchNotifications();
        } catch (error) {
            console.error('Ошибка при принятии заявки:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при принятии заявки');
            }
        }
    };

    const handleRejectRequest = async (teamId, memberId) => {
        try {
            const response = await axios.post(`${API_URL}teams/${teamId}/reject/`, {
                member_id: memberId,
            }, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            
            // Обновляем уведомления после отклонения заявки
            fetchNotifications();
        } catch (error) {
            console.error('Ошибка при отклонении заявки:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при отклонении заявки');
            }
        }
    };

    const handleViewProfile = (username) => {
        navigate(`/users/${username}`);
    };

    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm('Вы уверены, что хотите удалить это уведомление?')) {
            return;
        }

        try {
            const notification = notifications.find(n => n.id === notificationId);
            const wasUnread = notification && !notification.is_read;
            
            await axios.post(`${API_URL}users/delete_notification/`, {
                notification_id: notificationId,
            }, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            
            // Обновляем список уведомлений
            fetchNotifications();
            
            // Если удалили непрочитанное уведомление, обновляем счетчик
            if (wasUnread) {
                window.dispatchEvent(new Event('notificationUpdated'));
            }
        } catch (error) {
            console.error('Ошибка при удалении уведомления:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при удалении уведомления');
            }
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'TEAM_INVITATION':
                return '📨';
            case 'TEAM_REQUEST':
                return '📝';
            case 'TEAM_REQUEST_APPROVED':
                return '✅';
            case 'TEAM_REQUEST_REJECTED':
                return '❌';
            case 'TEAM_INVITATION_ACCEPTED':
                return '🎉';
            case 'TEAM_INVITATION_REJECTED':
                return '😞';
            default:
                return '📢';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Только что';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} ч. назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    };

    if (error) {
        return (
            <div className={styles.notifications_container} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки уведомлений"
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        fetchNotifications();
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner text="Загрузка уведомлений..." />;
    }

    return (
        <div className={styles.notifications_container}>
            <div className={styles.header}>
                <h2>Уведомления</h2>
                {notifications.some(n => !n.is_read) && (
                    <button 
                        className={styles.mark_all_read}
                        onClick={markAllAsRead}
                    >
                        Отметить все как прочитанные
                    </button>
                )}
            </div>

            <div className={styles.notifications_list}>
                {notifications.length === 0 ? (
                    <div className={styles.empty_state}>
                        <p>У вас пока нет уведомлений</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`${styles.notification_item} ${!notification.is_read ? styles.unread : ''}`}
                        >
                            <div className={styles.notification_content}>
                                <div className={styles.notification_header}>
                                    <span className={styles.icon}>
                                        {getNotificationIcon(notification.notification_type)}
                                    </span>
                                    <span className={styles.type}>
                                        {notification.notification_type_display}
                                    </span>
                                    <span className={styles.time}>
                                        {formatDate(notification.created_at)}
                                    </span>
                                </div>
                                
                                <div className={styles.notification_body}>
                                    <p className={styles.message}>{notification.message}</p>
                                    {notification.team_title && (
                                        <p className={styles.team_name}>
                                            Команда: {notification.team_title}
                                        </p>
                                    )}
                                    
                                    {/* Ссылка на профиль пользователя для запросов */}
                                    {notification.notification_type === 'TEAM_REQUEST' && notification.team_member && (
                                        <div className={styles.user_info}>
                                            <button 
                                                className={styles.profile_link}
                                                onClick={() => handleViewProfile(notification.team_member.user)}
                                            >
                                                👤 Посмотреть профиль пользователя
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Кнопки действий для приглашений */}
                                {notification.notification_type === 'TEAM_INVITATION' && notification.team_member && (
                                    <div className={styles.actions}>
                                        <button 
                                            className={styles.accept_btn}
                                            onClick={() => handleAcceptInvitation(notification.team_member.id)}
                                        >
                                            Принять
                                        </button>
                                        <button 
                                            className={styles.reject_btn}
                                            onClick={() => handleRejectInvitation(notification.team_member.id)}
                                        >
                                            Отклонить
                                        </button>
                                    </div>
                                )}

                                {/* Кнопки действий для запросов на вступление */}
                                {notification.notification_type === 'TEAM_REQUEST' && notification.team && notification.team_member && (
                                    <div className={styles.actions}>
                                        <button 
                                            className={styles.accept_btn}
                                            onClick={() => handleApproveRequest(notification.team, notification.team_member.id)}
                                        >
                                            ✓ Принять заявку
                                        </button>
                                        <button 
                                            className={styles.reject_btn}
                                            onClick={() => handleRejectRequest(notification.team, notification.team_member.id)}
                                        >
                                            ✗ Отклонить заявку
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.notification_actions}>
                                {!notification.is_read && (
                                    <button 
                                        className={styles.mark_read_btn}
                                        onClick={() => markAsRead(notification.id)}
                                        title="Отметить как прочитанное"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button 
                                    className={styles.delete_btn}
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    title="Удалить уведомление"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsComponent;
