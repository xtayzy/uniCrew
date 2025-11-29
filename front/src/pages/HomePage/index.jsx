import { useNavigate } from "react-router-dom";
import styles from "./style.module.css";
import { useAuth } from "../../hooks/useAuth";
import SEOHead from "../../components/SEOHead";

function HomePage() {
    const { isAuth } = useAuth();
    const navigate = useNavigate();

    const handleFindTeam = () => {
        navigate('/teams');
    };

    const handleCreateTeam = () => {
        if (isAuth) {
            navigate('/teams/create');
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            <SEOHead 
                title="UniCrew — Платформа для поиска команды студенческих проектов"
                description="Найди свою идеальную команду для учебных проектов, дипломных работ, хакатонов и стартапов. UniCrew помогает студентам находить единомышленников с нужными навыками."
                keywords="студенческие проекты, команда, хакатон, дипломная работа, стартап, поиск команды, студенты, проекты"
            />
            <div className={styles.home}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <h1 className={styles.hero_title}>
                    Найди свою идеальную команду для проектов! 🚀
                </h1>
                <p className={styles.hero_subtitle}>
                    uniCrew — это платформа, которая помогает студентам находить единомышленников 
                    с нужными навыками для учебных проектов, лабораторных работ, дипломных проектов и хакатонов.
                </p>
                <div className={styles.hero_actions}>
                    <button 
                        className={styles.hero_btn_primary}
                        onClick={handleFindTeam}
                    >
                        🔍 Найти команду
                    </button>
                    <button 
                        className={styles.hero_btn_secondary}
                        onClick={handleCreateTeam}
                    >
                        ➕ Создать команду
                    </button>
                </div>
            </section>


            {/* Features Section */}
            <section className={styles.features}>
                <h2 className={styles.features_title}>Почему выбирают uniCrew?</h2>
                <div className={styles.features_grid}>
                    <div className={styles.feature_card}>
                        <div className={styles.feature_icon}>🎯</div>
                        <h3 className={styles.feature_title}>Точный поиск</h3>
                        <p className={styles.feature_description}>
                            Находите участников по навыкам, курсу, факультету и личным качествам. 
                            Наша система фильтрации поможет найти именно тех людей, которые нужны для вашего проекта.
                        </p>
                    </div>
                    <div className={styles.feature_card}>
                        <div className={styles.feature_icon}>👥</div>
                        <h3 className={styles.feature_title}>Командная работа</h3>
                        <p className={styles.feature_description}>
                            Создавайте команды, приглашайте участников и управляйте проектами. 
                            Все инструменты для эффективной командной работы в одном месте.
                        </p>
                    </div>
                    <div className={styles.feature_card}>
                        <div className={styles.feature_icon}>🔔</div>
                        <h3 className={styles.feature_title}>Уведомления</h3>
                        <p className={styles.feature_description}>
                            Получайте уведомления о новых заявках, приглашениях и обновлениях проектов. 
                            Никогда не пропустите важные события.
                        </p>
                    </div>
                    <div className={styles.feature_card}>
                        <div className={styles.feature_icon}>🎓</div>
                        <h3 className={styles.feature_title}>Для студентов</h3>
                        <p className={styles.feature_description}>
                            Платформа создана специально для студентов. Учитываем особенности 
                            учебного процесса и помогаем в развитии профессиональных навыков.
                        </p>
                    </div>
                    <div className={styles.feature_card}>
                        <div className={styles.feature_icon}>⚡</div>
                        <h3 className={styles.feature_title}>Быстро и просто</h3>
                        <p className={styles.feature_description}>
                            Регистрация за 2 минуты, создание команды за 5 минут. 
                            Интуитивный интерфейс и быстрая навигация.
                        </p>
                    </div>
                    <div className={styles.feature_card}>
                        <div className={styles.feature_icon}>🛡️</div>
                        <h3 className={styles.feature_title}>Безопасность</h3>
                        <p className={styles.feature_description}>
                            Все данные защищены, приватность соблюдена. 
                            Проверенные участники и модерация контента.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works Section */}
            <section className={styles.how_it_works}>
                <h2 className={styles.how_it_works_title}>Как это работает?</h2>
                <div className={styles.steps}>
                    <div className={styles.step}>
                        <div className={styles.step_number}>1</div>
                        <h3 className={styles.step_title}>Создайте профиль</h3>
                        <p className={styles.step_description}>
                            Зарегистрируйтесь и заполните профиль с вашими навыками, 
                            образованием и личными качествами.
                        </p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.step_number}>2</div>
                        <h3 className={styles.step_title}>Найдите команду</h3>
                        <p className={styles.step_description}>
                            Просматривайте доступные проекты, используйте фильтры 
                            и подавайте заявки на вступление в интересные команды.
                        </p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.step_number}>3</div>
                        <h3 className={styles.step_title}>Создайте проект</h3>
                        <p className={styles.step_description}>
                            Или создайте свой проект и пригласите участников 
                            с нужными навыками для реализации вашей идеи.
                        </p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.step_number}>4</div>
                        <h3 className={styles.step_title}>Работайте вместе</h3>
                        <p className={styles.step_description}>
                            Управляйте командой, отслеживайте прогресс 
                            и создавайте удивительные проекты вместе!
                        </p>
                    </div>
                </div>
            </section>
        </div>
        </>
    );
}

export default HomePage;
