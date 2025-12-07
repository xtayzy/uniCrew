import { Link } from "react-router-dom";
import styles from "./style.module.css";
import { useAuth } from "../../hooks/useAuth";
import { Bell, User, LogOut, Users, Info, FileText, Shield } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config";

function Header() {
    const { isAuth, logout, tokens, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            setIsLoadingNotifications(true);
            const response = await axios.get(`${API_URL}users/notifications/`, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            const unread = response.data.filter(notif => !notif.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
            setUnreadCount(0);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, [tokens]);

    useEffect(() => {
        if (isAuth && tokens?.access) {
            fetchUnreadCount();
            // Обновляем счетчик каждые 30 секунд
            const interval = setInterval(fetchUnreadCount, 30000);
            
            // Слушаем события обновления уведомлений
            const handleNotificationUpdate = () => {
                fetchUnreadCount();
            };
            
            window.addEventListener('notificationUpdated', handleNotificationUpdate);
            
            return () => {
                clearInterval(interval);
                window.removeEventListener('notificationUpdated', handleNotificationUpdate);
            };
        } else {
            setUnreadCount(0);
            setIsLoadingNotifications(false);
        }
    }, [isAuth, tokens, fetchUnreadCount]);

    return (
        <header className={styles.header}>
            <div className={styles.header_container}>
                <Link to="/" className={styles.logo}>
                    <span className={styles.logo_text}>UniCrew</span>
                </Link>

                {/* Навигация */}
                <nav className={styles.nav} itemScope itemType="https://schema.org/SiteNavigationElement">
                    <Link to="/teams" className={styles.nav_link} itemProp="url">
                        <Users className={styles.nav_icon} size={18}/>
                        <span itemProp="name">Команды</span>
                    </Link>
                    <Link to="/users" className={styles.nav_link} itemProp="url">
                        <User className={styles.nav_icon} size={18}/>
                        <span itemProp="name">Пользователи</span>
                    </Link>
                    <Link to="/about" className={styles.nav_link} itemProp="url">
                        <Info className={styles.nav_icon} size={18}/>
                        <span itemProp="name">О сайте</span>
                    </Link>
                    {isAuth && (
                        <>
                            <div className={styles.nav_divider}></div>
                            <Link to="/my-requests" className={styles.nav_link} itemProp="url">
                                <FileText className={styles.nav_icon} size={18}/>
                                <span itemProp="name">Мои заявки</span>
                            </Link>
                            {user?.is_staff && (
                                <>
                                    <div className={styles.nav_divider}></div>
                                    <Link to="/admin" className={styles.nav_link} itemProp="url">
                                        <Shield className={styles.nav_icon} size={18}/>
                                        <span itemProp="name">Админ</span>
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </nav>

                {/* Правая часть */}
                <div className={styles.header_right}>
                    {isAuth ? (
                        <>
                            <Link to="/notifications" className={styles.notification_link} title="Уведомления">
                                <Bell className={styles.icon} size={20}/>
                                {!isLoadingNotifications && unreadCount > 0 && (
                                    <span className={styles.notification_badge}>{unreadCount}</span>
                                )}
                            </Link>
                            <Link to="/profile" className={styles.profile_link}>
                                <User className={styles.profile_icon} size={20}/>
                                <span className={styles.profile_text}>Профиль</span>
                            </Link>
                            <button onClick={handleLogout} className={styles.logout_btn} title="Выйти">
                                <LogOut size={16}/>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={styles.login_btn}>
                            <User className={styles.btn_icon} size={18}/>
                            <span>Войти</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
