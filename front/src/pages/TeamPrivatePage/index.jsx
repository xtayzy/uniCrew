import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "./style.module.css";
import JoinTeamModal from "../../components/JoinTeamModal";
import EditTeamModal from "../../components/EditTeamModal";
import ManageMembersModal from "../../components/ManageMembersModal";
import TaskTracker from "../../components/TaskTracker";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { API_URL } from "../../config.js";
import { useAuth } from "../../hooks/useAuth";

const TeamPrivatePage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { isAuth, tokens } = useAuth();
    const [team, setTeam] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);

    // Загрузка данных команды и пользователя
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Загружаем команду
                const teamResponse = await axios.get(`${API_URL}teams/${teamId}/`);
                setTeam(teamResponse.data);
                setLoading(false);

                // Загружаем пользователя
                if (isAuth && tokens) {
                    const decodedToken = jwtDecode(tokens.access);
                    const userResponse = await axios.get(`${API_URL}users/${decodedToken.user_id}/`, {
                        headers: {
                            'Authorization': `Bearer ${tokens.access}`
                        }
                    });
                    setCurrentUser(userResponse.data);
                }
                setUserLoading(false);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                setError(error);
                setLoading(false);
                setUserLoading(false);
            }
        };

        fetchData();
    }, [teamId, isAuth, tokens, forceUpdate]);

    // Проверяем статус участника (без автоматического редиректа)
    const checkMemberStatus = () => {
        if (!team || !currentUser) return null;
        
        // Получаем имя создателя команды (может быть строкой или объектом)
        const creatorName = typeof team.creator === 'string' ? team.creator : team.creator?.username;
        const isCreator = creatorName === currentUser.username;
        
        const isApprovedMember = Array.isArray(team.members) && team.members.some(member => 
            member.user === currentUser.username && member.status === 'APPROVED'
        );
        const isPendingMember = Array.isArray(team.members) && team.members.some(member => 
            member.user === currentUser.username && member.status === 'PENDING'
        );
        const isInvitedMember = Array.isArray(team.members) && team.members.some(member => 
            member.user === currentUser.username && member.status === 'INVITED'
        );
        
        return {
            isCreator,
            isApprovedMember,
            isPendingMember,
            isInvitedMember,
            isMember: isCreator || isApprovedMember || isPendingMember || isInvitedMember
        };
    };

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

    const handleEditTeam = () => {
        setIsEditModalOpen(true);
    };

    const handleManageMembers = () => {
        setIsManageMembersModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleCloseManageMembersModal = () => {
        setIsManageMembersModalOpen(false);
    };

    const handleDeleteTeam = async () => {
        if (!team) return;
        
        const confirmMessage = `Вы уверены, что хотите удалить команду "${team.title}"?\n\nЭто действие нельзя отменить. Все данные команды, включая задачи и участников, будут удалены.`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }
        
        try {
            await axios.delete(`${API_URL}teams/${teamId}/`, {
                headers: {
                    'Authorization': `Bearer ${tokens?.access}`,
                }
            });
            
            alert('Команда успешно удалена');
            navigate('/teams');
        } catch (error) {
            console.error('Ошибка удаления команды:', error);
            if (error.response?.status === 403) {
                alert('У вас нет прав для удаления этой команды');
            } else if (error.response?.status === 404) {
                alert('Команда не найдена');
            } else {
                alert('Ошибка при удалении команды');
            }
        }
    };

    const handleTeamUpdate = async (updatedData) => {
        try {
            const response = await axios.put(
                `${API_URL}teams/${teamId}/update_team/`,
                updatedData,
                {
                    headers: {
                        'Authorization': `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Обновляем состояние команды с новыми данными
            setTeam(response.data);
            
            // Перезагружаем данные пользователя на случай, если что-то изменилось
            if (isAuth && tokens) {
                try {
                    const decodedToken = jwtDecode(tokens.access);
                    const userResponse = await axios.get(`${API_URL}users/${decodedToken.user_id}/`, {
                        headers: {
                            'Authorization': `Bearer ${tokens.access}`
                        }
                    });
                    setCurrentUser(userResponse.data);
                } catch (userError) {
                    console.warn('Не удалось обновить данные пользователя:', userError);
                }
            }
            
            // Принудительно обновляем компонент
            setForceUpdate(prev => prev + 1);
            
            setIsEditModalOpen(false);
            alert('Команда успешно обновлена!');
            
        } catch (error) {
            console.error('Ошибка обновления команды:', error);
            alert('Ошибка при обновлении команды');
        }
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
        const memberStatus = checkMemberStatus();
        return memberStatus && !memberStatus.isCreator && !memberStatus.isMember;
    };

    const isTeamMember = () => {
        const memberStatus = checkMemberStatus();
        return memberStatus?.isMember || false;
    };

    const isApprovedMember = () => {
        const memberStatus = checkMemberStatus();
        return memberStatus?.isApprovedMember || false;
    };

    const isPendingMember = () => {
        const memberStatus = checkMemberStatus();
        return memberStatus?.isPendingMember || false;
    };

    const isInvitedMember = () => {
        const memberStatus = checkMemberStatus();
        return memberStatus?.isInvitedMember || false;
    };

    const getApprovedMembers = () => {
        return Array.isArray(team.members) ? team.members.filter(member => member.status === 'APPROVED') : [];
    };

    const getPendingRequests = () => {
        return Array.isArray(team.members) ? team.members.filter(member => member.status === 'PENDING') : [];
    };

    const getInvitedMembers = () => {
        return Array.isArray(team.members) ? team.members.filter(member => member.status === 'INVITED') : [];
    };

    const isTeamCreator = () => {
        const memberStatus = checkMemberStatus();
        return memberStatus?.isCreator || false;
    };

    if (error) {
        return (
            <div className={styles.team_detail_page} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки команды"
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        setUserLoading(true);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (loading || userLoading) {
        return <LoadingSpinner text="Загрузка команды..." />;
    }

    if (!team) {
        return (
            <div className={styles.team_detail_page} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={{ message: 'Команда не найдена', status: 404 }}
                    title="Команда не найдена"
                    onRetry={() => window.location.reload()}
                    fullScreen={false}
                />
            </div>
        );
    }
    });

    // Проверка доступа к приватной странице (только после загрузки)
    if (!isAuth) {
        return (
            <div className={styles.error}>
                <h2>Доступ запрещен</h2>
                <p>Для просмотра приватной страницы команды необходимо войти в систему.</p>
                <div className={styles.error_actions}>
                    <button onClick={() => navigate('/login')} className={styles.back_btn}>
                        Войти в систему
                    </button>
                    <button onClick={() => navigate('/teams/${teamId}')} className={styles.public_btn}>
                        Публичная страница
                    </button>
                </div>
            </div>
        );
    }

    // Показываем информацию о статусе участника
    const memberStatus = checkMemberStatus();
    const showLimitedAccess = memberStatus && !memberStatus.isMember;

    return (
        <div className={styles.team_detail_page}>
            <div className={styles.header}>
                <button onClick={() => navigate('/teams')} className={styles.back_btn}>
                    ← Назад к командам
                </button>
                <div className={styles.header_actions}>
                    <button 
                        className={styles.public_btn} 
                        onClick={() => navigate(`/teams/${teamId}`)}
                    >
                        Публичная страница
                    </button>
                    {canJoinTeam() && (
                        <button className={styles.join_btn} onClick={handleJoinTeam}>
                            Подать заявку
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

                    {(team.whatsapp_link || team.telegram_link) && (
                        <div className={styles.messenger_links}>
                            <h3>Ссылки на мессенджеры</h3>
                            <div className={styles.links_container}>
                                {team.whatsapp_link && (
                                    <a 
                                        href={team.whatsapp_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.messenger_link}
                                    >
                                        <span className={styles.whatsapp_icon}>📱</span>
                                        WhatsApp группа
                                    </a>
                                )}
                                {team.telegram_link && (
                                    <a 
                                        href={team.telegram_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={styles.messenger_link}
                                    >
                                        <span className={styles.telegram_icon}>✈️</span>
                                        Telegram группа
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.requirements}>
                        <div className={styles.requirement_section}>
                            <h3>Требуемые навыки</h3>
                            <div className={styles.tags}>
                                {Array.isArray(team.required_skills) && team.required_skills.length > 0 ? (
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
                                {Array.isArray(team.required_qualities) && team.required_qualities.length > 0 ? (
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
                    {/* Создатель команды - отображается мелко */}
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

                    {/* Участники команды - только для участников */}
                    {isTeamMember() && (
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
                    )}

                    {/* Заявки и приглашения - только для создателя */}
                    {isTeamCreator() && (
                        <div className={styles.requests_section}>
                            <h3>Заявки и приглашения</h3>
                            <div className={styles.requests_list}>
                                {getPendingRequests().map((member) => (
                                    <div key={member.id} className={styles.request_item}>
                                        <div className={styles.request_info}>
                                            <span 
                                                className={styles.request_name}
                                                onClick={() => navigate(`/users/${member.user}`)}
                                            >
                                                @{member.user}
                                            </span>
                                            <span className={styles.request_status}>
                                                Заявка
                                            </span>
                                        </div>
                                        {member.message && (
                                            <div className={styles.request_message}>
                                                {member.message}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {getInvitedMembers().map((member) => (
                                    <div key={member.id} className={styles.request_item}>
                                        <div className={styles.request_info}>
                                            <span 
                                                className={styles.request_name}
                                                onClick={() => navigate(`/users/${member.user}`)}
                                            >
                                                @{member.user}
                                            </span>
                                            <span className={styles.invited_status}>
                                                Приглашен
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                
                                {getPendingRequests().length === 0 && getInvitedMembers().length === 0 && (
                                    <p className={styles.no_requests}>Нет заявок и приглашений</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.actions_section}>
                        <h3>Действия</h3>
                        <div className={styles.action_buttons}>
                            {showLimitedAccess ? (
                                <div className={styles.limited_access}>
                                    <div className={styles.status_message}>
                                        Эта страница предназначена для участников команды
                                    </div>
                                    <div className={styles.access_actions}>
                                        <button className={styles.join_btn} onClick={handleJoinTeam}>
                                            Подать заявку на вступление
                                        </button>
                                        <button 
                                            className={styles.public_btn} 
                                            onClick={() => navigate(`/teams/${teamId}`)}
                                        >
                                            Публичная страница
                                        </button>
                                    </div>
                                </div>
                            ) : isTeamCreator() ? (
                                <div className={styles.owner_actions}>
                                    <div className={styles.status_message}>
                                        Вы создатель этой команды
                                    </div>
                                    <button className={styles.edit_btn} onClick={handleEditTeam}>
                                        Редактировать команду
                                    </button>
                                    <button className={styles.manage_btn} onClick={handleManageMembers}>
                                        Управление участниками
                                    </button>
                                    <button className={styles.delete_btn} onClick={handleDeleteTeam}>
                                        Удалить команду
                                    </button>
                                </div>
                            ) : isPendingMember() ? (
                                <div className={styles.status_message}>
                                    Ваша заявка на вступление ожидает рассмотрения
                                </div>
                            ) : isInvitedMember() ? (
                                <div className={styles.status_message}>
                                    Вас пригласили в команду
                                </div>
                            ) : isApprovedMember() ? (
                                <div className={styles.status_message}>
                                    Вы участник этой команды
                                </div>
                            ) : (
                                <div className={styles.status_message}>
                                    Статус не определен
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Трекер задач - только для участников команды */}
            {isTeamMember() && (
                <TaskTracker 
                    team={team}
                    currentUser={currentUser}
                    isTeamCreator={isTeamCreator()}
                />
            )}

            <JoinTeamModal
                team={selectedTeam}
                isOpen={isJoinModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleJoinSuccess}
            />

            <EditTeamModal
                team={team}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onUpdate={handleTeamUpdate}
            />

            <ManageMembersModal
                team={team}
                isOpen={isManageMembersModalOpen}
                onClose={handleCloseManageMembersModal}
                onUpdate={() => {
                    // Перезагружаем данные команды
                    const fetchTeam = async () => {
                        try {
                            const response = await axios.get(`${API_URL}teams/${teamId}/`);
                            setTeam(response.data);
                            // Принудительно обновляем компонент
                            setForceUpdate(prev => prev + 1);
                        } catch (error) {
                            console.error('Ошибка загрузки команды:', error);
                        }
                    };
                    fetchTeam();
                }}
            />
        </div>
    );
};

export default TeamPrivatePage;
