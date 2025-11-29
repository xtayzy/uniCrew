import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config.js";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import styles from "./style.module.css";
import { Users, Calendar, Tag, CheckCircle, XCircle, LogIn, UserPlus } from "lucide-react";

function InvitePage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isAuth, login_context } = useAuth();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionResult, setActionResult] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                setError(null);
                const response = await axios.get(`${API_URL}teams/invite/?token=${token}`);
                setTeam(response.data);
            } catch (err) {
                console.error("Ошибка загрузки команды:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTeam();
        }
    }, [token]);

    const handleJoin = async () => {
        if (!isAuth) {
            // Сохраняем токен в localStorage для использования после регистрации
            localStorage.setItem("pending_invite_token", token);
            navigate("/register-step1");
            return;
        }

        setActionLoading(true);
        setActionResult(null);
        try {
            const response = await axios.post(`${API_URL}teams/invite/`, { token });
            setActionResult({ type: "success", message: response.data.detail || "Вы присоединились к команде!" });
            setTimeout(() => {
                if (response.data.team_id) {
                    navigate(`/teams/${response.data.team_id}`);
                } else {
                    navigate("/my-teams");
                }
            }, 2000);
        } catch (err) {
            console.error("Ошибка вступления в команду:", err);
            setActionResult({ 
                type: "error", 
                message: err.response?.data?.detail || "Ошибка при вступлении в команду" 
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = () => {
        navigate("/");
    };

    if (loading) {
        return <LoadingSpinner text="Загрузка приглашения..." />;
    }

    if (error) {
        return (
            <div className={styles.container}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки приглашения"
                    onRetry={() => window.location.reload()}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (!team) {
        return (
            <div className={styles.container}>
                <div className={styles.error_message}>
                    <p>Команда не найдена</p>
                </div>
            </div>
        );
    }

    const statusColors = {
        OPEN: "#10b981",
        CLOSED: "#ef4444",
        IN_PROGRESS: "#3b82f6",
        DONE: "#6b7280",
    };

    const statusText = {
        OPEN: "Открыт набор",
        CLOSED: "Набор закрыт",
        IN_PROGRESS: "В работе",
        DONE: "Завершён",
    };

    return (
        <div className={styles.container}>
            <div className={styles.invite_card}>
                <div className={styles.header}>
                    <div className={styles.icon_wrapper}>
                        <Users size={32} />
                    </div>
                    <h1 className={styles.title}>Приглашение в команду</h1>
                    <p className={styles.subtitle}>Вас пригласили присоединиться к проекту</p>
                </div>

                <div className={styles.team_info}>
                    <h2 className={styles.team_title}>{team.title}</h2>
                    
                    <div className={styles.team_meta}>
                        <div className={styles.meta_item}>
                            <Tag size={16} />
                            <span>{team.category}</span>
                        </div>
                        <div className={styles.meta_item}>
                            <Calendar size={16} />
                            <span>{new Date(team.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className={styles.meta_item} style={{ color: statusColors[team.status] }}>
                            <div className={styles.status_dot} style={{ backgroundColor: statusColors[team.status] }}></div>
                            <span>{statusText[team.status]}</span>
                        </div>
                    </div>

                    {team.description && (
                        <div className={styles.description}>
                            <p>{team.description}</p>
                        </div>
                    )}

                    {team.creator && (
                        <div className={styles.creator}>
                            <span className={styles.creator_label}>Создатель:</span>
                            <span className={styles.creator_name}>{team.creator}</span>
                        </div>
                    )}

                    {team.members && team.members.length > 0 && (
                        <div className={styles.members}>
                            <span className={styles.members_label}>Участников: {team.members.filter(m => m.status === "APPROVED").length}</span>
                        </div>
                    )}

                    {team.required_skills && team.required_skills.length > 0 && (
                        <div className={styles.skills}>
                            <span className={styles.skills_label}>Требуемые навыки:</span>
                            <div className={styles.tags}>
                                {team.required_skills.map((skill, index) => (
                                    <span key={index} className={styles.tag}>{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {actionResult && (
                    <div className={`${styles.result_message} ${styles[actionResult.type]}`}>
                        {actionResult.message}
                    </div>
                )}

                <div className={styles.actions}>
                    {!isAuth ? (
                        <>
                            <Link to={`/register-step1?invite=${token}`} className={styles.join_btn}>
                                <UserPlus size={20} />
                                <span>Зарегистрироваться и вступить</span>
                            </Link>
                            <Link to={`/login?invite=${token}`} className={styles.login_btn}>
                                <LogIn size={20} />
                                <span>Войти и вступить</span>
                            </Link>
                            <button onClick={handleReject} className={styles.reject_btn}>
                                <XCircle size={20} />
                                <span>Отклонить</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={handleJoin} 
                                className={styles.join_btn}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <LoadingSpinner size="small" text="" />
                                ) : (
                                    <CheckCircle size={20} />
                                )}
                                <span>{actionLoading ? "Обработка..." : "Принять приглашение"}</span>
                            </button>
                            <button 
                                onClick={handleReject} 
                                className={styles.reject_btn}
                                disabled={actionLoading}
                            >
                                <XCircle size={20} />
                                <span>Отклонить</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InvitePage;

