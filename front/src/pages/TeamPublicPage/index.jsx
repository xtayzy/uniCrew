import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "./style.module.css";
import { API_URL } from "../../config.js";
import JoinTeamModal from "../../components/JoinTeamModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { useAuth } from "../../hooks/useAuth";

const TeamPublicPage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { isAuth, tokens } = useAuth();
    const [team, setTeam] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await axios.get(`${API_URL}teams/${teamId}/`);
                setTeam(response.data);
            } catch (error) {
                console.error('Ошибка загрузки команды:', error);
                setError(`Команда не найдена`);
            } finally {
                setLoading(false);
            }
        };

        const fetchCurrentUser = async () => {
            if (isAuth && tokens) {
                try {
                    const decodedToken = jwtDecode(tokens.access);
                    const response = await axios.get(`${API_URL}users/${decodedToken.user_id}/`, {
                        headers: {
                            'Authorization': `Bearer ${tokens.access}`
                        }
                    });
                    setCurrentUser(response.data);
                } catch (error) {
                    console.error('Ошибка получения информации о пользователе:', error);
                }
            }
        };

        fetchTeam();
        fetchCurrentUser();
    }, [teamId, isAuth, tokens]);

    const handleJoinTeam = () => {
        setSelectedTeam(team);
        setIsJoinModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsJoinModalOpen(false);
        setSelectedTeam(null);
    };

    const handleJoinSuccess = (message) => {
        alert(message);
        navigate('/teams');
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'OPEN': 'Открыт набор',
            'CLOSED': 'Набор закрыт',
            'IN_PROGRESS': 'В работе',
            'DONE': 'Завершён'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'OPEN': '#10b981',
            'CLOSED': '#ef4444',
            'IN_PROGRESS': '#f59e0b',
            'DONE': '#6b7280'
        };
        return colorMap[status] || '#6b7280';
    };

    const canJoinTeam = () => {
        if (!isAuth || !team || !currentUser) return false;
        return team.creator !== currentUser.username && 
               !(team.members || []).some(member => member.user === currentUser.username);
    };

    const isTeamCreator = () => {
        return isAuth && team && currentUser && team.creator === currentUser.username;
    };

    const isTeamMember = () => {
        if (!isAuth || !team || !currentUser) return false;
        return team.members?.some(member => 
            member.user === currentUser.username && member.status === 'APPROVED'
        ) || team.creator === currentUser.username;
    };

    const getApprovedMembers = () => {
        return (team.members || []).filter(member => member.status === 'APPROVED');
    };

    if (error) {
        return (
            <div className={styles.team_public_page} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки команды"
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen={true} text="Загрузка команды..." />;
    }

    if (!team) {
        return (
            <div className={styles.team_public_page} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={{ message: 'Команда не найдена', status: 404 }}
                    title="Команда не найдена"
                    onRetry={() => window.location.reload()}
                    fullScreen={false}
                />
            </div>
        );
    }

    return (
        <div className={styles.team_public_page}>
            <div className={styles.header}>
                <button onClick={() => navigate('/teams')} className={styles.back_btn}>
                    ← Назад к командам
                </button>
                <div className={styles.header_actions}>
                    {canJoinTeam() && (
                        <button className={styles.join_btn} onClick={handleJoinTeam}>
                            Подать заявку
                        </button>
                    )}
                    {isTeamMember() && (
                        <button 
                            className={styles.private_btn} 
                            onClick={() => navigate(`/teams/${teamId}/private`)}
                        >
                            Перейти к приватной странице
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.team_content}>
                <div className={styles.team_main}>
                    <div className={styles.team_header}>
                        <h1 className={styles.team_title}>{team.title}</h1>
                        <div 
                            className={styles.status_badge}
                            style={{ backgroundColor: getStatusColor(team.status) }}
                        >
                            {getStatusDisplay(team.status)}
                        </div>
                    </div>

                    <div className={styles.team_description}>
                        <h3>Описание проекта</h3>
                        <p>{team.description}</p>
                    </div>

                    <div className={styles.team_info}>
                        <div className={styles.info_item}>
                            <h4>Категория</h4>
                            <span className={styles.category_tag}>{team.category}</span>
                        </div>
                        <div className={styles.info_item}>
                            <h4>Создатель</h4>
                            <span 
                                className={styles.creator_link}
                                onClick={() => navigate(`/users/${typeof team.creator === 'string' ? team.creator : team.creator?.username || team.creator}`)}
                            >
                                @{typeof team.creator === 'string' ? team.creator : team.creator?.username || team.creator}
                            </span>
                        </div>
                        <div className={styles.info_item}>
                            <h4>Дата создания</h4>
                            <span>{team.created_at ? new Date(team.created_at).toLocaleDateString('ru-RU') : 'Не указана'}</span>
                        </div>
                    </div>

                    <div className={styles.requirements}>
                        <div className={styles.requirement_section}>
                            <h3>Требуемые навыки</h3>
                            <div className={styles.tags}>
                                {team.required_skills && team.required_skills.length > 0 ? (
                                    team.required_skills.map((skill, index) => (
                                        <span key={index} className={styles.skill_tag}>
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className={styles.no_requirements}>Навыки не указаны</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.requirement_section}>
                            <h3>Требуемые качества</h3>
                            <div className={styles.tags}>
                                {team.required_qualities && team.required_qualities.length > 0 ? (
                                    team.required_qualities.map((quality, index) => (
                                        <span key={index} className={styles.quality_tag}>
                                            {quality}
                                        </span>
                                    ))
                                ) : (
                                    <p className={styles.no_requirements}>Качества не указаны</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.team_sidebar}>
                    {/* Создатель команды */}
                    <div className={styles.creator_section}>
                        <h4>Создатель команды</h4>
                        <div className={styles.creator_info}>
                            <span 
                                className={styles.creator_name}
                                onClick={() => navigate(`/users/${typeof team.creator === 'string' ? team.creator : team.creator?.username || team.creator}`)}
                            >
                                @{typeof team.creator === 'string' ? team.creator : team.creator?.username || team.creator}
                            </span>
                        </div>
                    </div>

                    {/* Участники команды - только одобренные */}
                    <div className={styles.members_section}>
                        <h3>Участники команды</h3>
                        <div className={styles.members_list}>
                            {getApprovedMembers().length > 0 ? (
                                getApprovedMembers().map((member) => (
                                    <div key={member.id} className={styles.member_item}>
                                        <div className={styles.member_info}>
                                            <span 
                                                className={styles.member_name}
                                                onClick={() => navigate(`/users/${member.user}`)}
                                            >
                                                @{member.user}
                                            </span>
                                            <span className={styles.member_status_approved}>
                                                Участник
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.no_members}>Участники не найдены</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.actions_section}>
                        <h3>Действия</h3>
                        <div className={styles.action_buttons}>
                            {canJoinTeam() ? (
                                <button className={styles.join_btn} onClick={handleJoinTeam}>
                                    Подать заявку на вступление
                                </button>
                            ) : isTeamCreator() ? (
                                <div className={styles.status_message}>
                                    Вы создатель этой команды
                                </div>
                            ) : isTeamMember() ? (
                                <div className={styles.status_message}>
                                    Вы участник этой команды
                                </div>
                            ) : (
                                <div className={styles.status_message}>
                                    Войдите в систему, чтобы подать заявку
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <JoinTeamModal
                team={selectedTeam}
                isOpen={isJoinModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleJoinSuccess}
            />
        </div>
    );
};

export default TeamPublicPage;
