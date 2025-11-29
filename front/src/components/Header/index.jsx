import { Link, useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { useAuth } from "../../hooks/useAuth";
import { Bell, User, LogOut, Users, Info, FileText, Menu, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config";

function Header() {
    const { isAuth, logout, tokens } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}users/notifications/`, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            const unread = response.data.filter(notif => !notif.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        }
    }, [tokens]);

    useEffect(() => {
        if (isAuth && tokens?.access) {
            fetchUnreadCount();
            // Обновляем счетчик каждые 30 секунд
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuth, tokens, fetchUnreadCount]);

    // Закрытие меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest(`.${styles.mobile_menu}`) && !event.target.closest(`.${styles.menu_toggle}`)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.header_container}>
                    {/* Hamburger menu для мобильных */}
                    <button 
                        className={styles.menu_toggle}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Меню"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <Link to="/" className={styles.logo} onClick={handleNavClick}>
                        <span className={styles.logo_text}>UniCrew</span>
                    </Link>

                    {/* Навигация для десктопа */}
                    <nav className={styles.nav}>
                        <Link to="/teams" className={styles.nav_link}>
                            <Users className={styles.nav_icon} size={18}/>
                            <span>Команды</span>
                        </Link>
                        <Link to="/users" className={styles.nav_link}>
                            <User className={styles.nav_icon} size={18}/>
                            <span>Пользователи</span>
                        </Link>
                        <Link to="/about" className={styles.nav_link}>
                            <Info className={styles.nav_icon} size={18}/>
                            <span>О сайте</span>
                        </Link>
                        {isAuth && (
                            <>
                                <div className={styles.nav_divider}></div>
                                <Link to="/my-requests" className={styles.nav_link}>
                                    <FileText className={styles.nav_icon} size={18}/>
                                    <span>Мои заявки</span>
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Правая часть */}
                    <div className={styles.header_right}>
                        {isAuth ? (
                            <>
                                <Link to="/notifications" className={styles.notification_link} title="Уведомления" onClick={handleNavClick}>
                                    <Bell className={styles.icon} size={20}/>
                                    {unreadCount > 0 && (
                                        <span className={styles.notification_badge}>{unreadCount}</span>
                                    )}
                                </Link>
                                <Link to="/profile" className={styles.profile_link} onClick={handleNavClick}>
                                    <User className={styles.profile_icon} size={20}/>
                                    <span className={styles.profile_text}>Профиль</span>
                                </Link>
                                <button onClick={handleLogout} className={styles.logout_btn} title="Выйти">
                                    <LogOut size={16}/>
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className={styles.login_btn} onClick={handleNavClick}>
                                <User className={styles.btn_icon} size={18}/>
                                <span>Войти</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Выдвижное меню для мобильных */}
            {isMenuOpen && (
                <div className={`${styles.mobile_menu_overlay} ${styles.mobile_menu_overlay_open}`} onClick={() => setIsMenuOpen(false)}>
                    <nav className={`${styles.mobile_menu} ${styles.mobile_menu_open}`} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.mobile_menu_header}>
                        <span className={styles.mobile_menu_title}>Меню</span>
                        <button 
                            className={styles.mobile_menu_close}
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Закрыть меню"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className={styles.mobile_menu_content}>
                        <Link to="/teams" className={styles.mobile_nav_link} onClick={handleNavClick}>
                            <Users className={styles.mobile_nav_icon} size={20}/>
                            <span>Команды</span>
                        </Link>
                        <Link to="/users" className={styles.mobile_nav_link} onClick={handleNavClick}>
                            <User className={styles.mobile_nav_icon} size={20}/>
                            <span>Пользователи</span>
                        </Link>
                        <Link to="/about" className={styles.mobile_nav_link} onClick={handleNavClick}>
                            <Info className={styles.mobile_nav_icon} size={20}/>
                            <span>О сайте</span>
                        </Link>
                        {isAuth && (
                            <>
                                <div className={styles.mobile_nav_divider}></div>
                                <Link to="/my-requests" className={styles.mobile_nav_link} onClick={handleNavClick}>
                                    <FileText className={styles.mobile_nav_icon} size={20}/>
                                    <span>Мои заявки</span>
                                </Link>
                                <Link to="/my-teams" className={styles.mobile_nav_link} onClick={handleNavClick}>
                                    <Users className={styles.mobile_nav_icon} size={20}/>
                                    <span>Мои команды</span>
                                </Link>
                            </>
                        )}
                    </div>
                    </nav>
                </div>
            )}
        </>
    );
}

export default Header;
