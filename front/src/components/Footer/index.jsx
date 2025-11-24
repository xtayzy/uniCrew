import { Link } from 'react-router-dom';
import styles from './style.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer_container}>
                {/* Основная информация */}
                <div className={styles.footer_section}>
                    <div className={styles.footer_logo}>
                        <h3>uniCrew 🚀</h3>
                        <p className={styles.footer_description}>
                            Платформа для поиска команды и участников для учебных проектов
                        </p>
                    </div>
                </div>

                {/* Навигация */}
                <div className={styles.footer_section}>
                    <h4 className={styles.footer_title}>Навигация</h4>
                    <ul className={styles.footer_links}>
                        <li><Link to="/" className={styles.footer_link}>Главная</Link></li>
                        <li><Link to="/teams" className={styles.footer_link}>Команды</Link></li>
                        <li><Link to="/about" className={styles.footer_link}>О проекте</Link></li>
                    </ul>
                </div>

                {/* Для пользователей */}
                <div className={styles.footer_section}>
                    <h4 className={styles.footer_title}>Для пользователей</h4>
                    <ul className={styles.footer_links}>
                        <li><Link to="/login" className={styles.footer_link}>Войти</Link></li>
                        <li><Link to="/register-step1" className={styles.footer_link}>Регистрация</Link></li>
                        <li><Link to="/profile" className={styles.footer_link}>Профиль</Link></li>
                        <li><Link to="/notifications" className={styles.footer_link}>Уведомления</Link></li>
                    </ul>
                </div>

                {/* Поддержка */}
                <div className={styles.footer_section}>
                    <h4 className={styles.footer_title}>Поддержка</h4>
                    <ul className={styles.footer_links}>
                        <li><a href="mailto:support@unicrew.ru" className={styles.footer_link}>Связаться с нами</a></li>
                        <li><a href="#" className={styles.footer_link}>Помощь</a></li>
                        <li><a href="#" className={styles.footer_link}>FAQ</a></li>
                        <li><a href="#" className={styles.footer_link}>Правила использования</a></li>
                    </ul>
                </div>

                {/* Социальные сети */}
                <div className={styles.footer_section}>
                    <h4 className={styles.footer_title}>Мы в соцсетях</h4>
                    <div className={styles.social_links}>
                        <a href="#" className={styles.social_link} aria-label="Telegram">
                            <span className={styles.social_icon}>❖</span>
                        </a>
                        <a href="#" className={styles.social_link} aria-label="VKontakte">
                            <span className={styles.social_icon}>❖</span>
                        </a>
                        <a href="#" className={styles.social_link} aria-label="Discord">
                            <span className={styles.social_icon}>❖</span>
                        </a>
                        <a href="#" className={styles.social_link} aria-label="GitHub">
                            <span className={styles.social_icon}>❖</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* <div className={styles.footer_bottom}>
                <div className={styles.footer_bottom_container}>
                    <div className={styles.footer_copyright}>
                        <p>&copy; 2024 uniCrew. Все права защищены.</p>
                    </div>
                    <div className={styles.footer_legal}>
                        <a href="#" className={styles.footer_legal_link}>Политика конфиденциальности</a>
                        <a href="#" className={styles.footer_legal_link}>Условия использования</a>
                    </div>
                </div>
            </div> */}
        </footer>
    );
}

export default Footer;
