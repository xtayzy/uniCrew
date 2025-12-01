import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../TeamsPage/style.module.css";
import InviteUserModal from "../../components/InviteUserModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { API_URL } from "../../config.js";
import { useAuth } from "../../hooks/useAuth";


export default function MyTeamsPage() {
    const { tokens } = useAuth();
    const navigate = useNavigate();
    const [ownerTeams, setOwnerTeams] = useState([]);
    const [memberTeams, setMemberTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [teamRequests, setTeamRequests] = useState({});

    const headers = useMemo(() => {
        const hdrs = {};
        if (tokens?.access) hdrs.Authorization = `Bearer ${tokens.access}`;
        return hdrs;
    }, [tokens]);

    useEffect(() => {
        const run = async () => {
            setError(null);
            setLoading(true);
            try {
                // 1) Узнаём username текущего пользователя
                const me = await axios.get(`${API_URL}profile/`, { headers });
                const uname = me?.data?.username;

                // 2) Загружаем команды, где он создатель (серверный фильтр)
                const [ownersRes, allRes] = await Promise.all([
                    axios.get(`${API_URL}teams/?creator_name=${encodeURIComponent(uname)}`, { headers }),
                    axios.get(`${API_URL}teams/`, { headers }),
                ]);

                const owners = ownersRes.data || [];
                const all = allRes.data || [];

                // 3) Команды, где он участник (фильтр по members на клиенте)
                const members = all.filter((t) => Array.isArray(t.members) && t.members.some((m) => m.user === uname) && t.creator !== uname);

                setOwnerTeams(owners);
                setMemberTeams(members);
            } catch (e) {
                console.error(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        if (tokens?.access) run();
    }, [headers, tokens]);

    const fetchTeamRequests = async (teamId) => {
        try {
            const response = await axios.get(`${API_URL}teams/${teamId}/requests/`, { headers });
            setTeamRequests(prev => ({ ...prev, [teamId]: response.data }));
        } catch (error) {
              console.error('Ошибка загрузки заявок:', error);
        }
    };

    const handleApproveRequest = async (teamId, memberId) => {
        try {
            await axios.post(`${API_URL}teams/${teamId}/approve/`, { member_id: memberId }, { headers });
            await fetchTeamRequests(teamId);
            alert('Заявка одобрена');
        } catch (error) {
            console.error('Ошибка при одобрении заявки:', error);
            alert('Произошла ошибка при одобрении заявки');
        }
    };

    const handleRejectRequest = async (teamId, memberId) => {
        try {
            await axios.post(`${API_URL}teams/${teamId}/reject/`, { member_id: memberId }, { headers });
            await fetchTeamRequests(teamId);
            alert('Заявка отклонена');
        } catch (error) {
            console.error('Ошибка при отклонении заявки:', error);
            alert('Произошла ошибка при отклонении заявки');
        }
    };

    const handleInviteUser = (team) => {
        setSelectedTeam(team);
        setIsInviteModalOpen(true);
    };

    const handleCloseInviteModal = () => {
        setIsInviteModalOpen(false);
        setSelectedTeam(null);
    };

    const handleInviteSuccess = (message) => {
        alert(message);
    };

    if (error) {
        return (
            <div className={styles.teams_page}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки команд"
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (loading) return <LoadingSpinner text="Загрузка команд..." />;

    return (
        <div className={styles.teams_page}>
            <div className={styles.toolbar}>
                <h1>Мои команды</h1>
            </div>

            <section style={{ marginTop: 8 }}>
                <h2>Я создатель</h2>
                {ownerTeams.length === 0 ? (
                    <p>Пока нет созданных команд.</p>
                ) : (
                    <div className={styles.teams_grid}>
                        {ownerTeams.map((t) => (
                            <div key={t.id} className={styles.team_card}>
                                <h2 
                                    className={styles.team_title_link}
                                    onClick={() => navigate(`/teams/${t.id}`)}
                                >
                                    {t.title}
                                </h2>
                                <p>{t.description}</p>
                                <p><strong>Категория:</strong> {t.category}</p>
                                <p><strong>Статус:</strong> {t.status}</p>
                                <div className={styles.team_tags}>
                                    {t.required_skills?.map((skill, i) => (
                                        <span key={i} className={styles.tag}>{skill}</span>
                                    ))}
                                </div>
                                <div className={styles.team_tags}>
                                    {t.required_qualities?.map((q, i) => (
                                        <span key={i} className={styles.tag_quality}>{q}</span>
                                    ))}
                                </div>
                                <ul>
                                    {t.members?.map((m) => (
                                        <li key={m.id}>{m.user}</li>
                                    ))}
                                </ul>
                                <span className={styles.created_at}>
                                    Создано: {new Date(t.created_at).toLocaleString()}
                                </span>
                                
                                <div className={styles.team_actions}>
                                    <button 
                                        className={styles.invite_btn}
                                        onClick={() => handleInviteUser(t)}
                                    >
                                        Пригласить пользователя
                                    </button>
                                    <button 
                                        className={styles.requests_btn}
                                        onClick={() => fetchTeamRequests(t.id)}
                                    >
                                        Заявки ({teamRequests[t.id]?.length || 0})
                                    </button>
                                </div>

                                {teamRequests[t.id] && teamRequests[t.id].length > 0 && (
                                    <div className={styles.requests_section}>
                                        <h4>Заявки на вступление:</h4>
                                        {teamRequests[t.id].map((request) => (
                                            <div key={request.id} className={styles.request_item}>
                                                <div className={styles.request_info}>
                                                    <strong>{request.user}</strong>
                                                    {request.message && (
                                                        <p className={styles.request_message}>
                                                            {request.message}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={styles.request_actions}>
                                                    <button 
                                                        className={styles.approve_btn}
                                                        onClick={() => handleApproveRequest(t.id, request.id)}
                                                    >
                                                        ✓ Принять
                                                    </button>
                                                    <button 
                                                        className={styles.reject_btn}
                                                        onClick={() => handleRejectRequest(t.id, request.id)}
                                                    >
                                                        ✗ Отклонить
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section style={{ marginTop: 16 }}>
                <h2>Я участник</h2>
                {memberTeams.length === 0 ? (
                    <p>Пока нет команд, где вы участник.</p>
                ) : (
                    <div className={styles.teams_grid}>
                        {memberTeams.map((t) => (
                            <div key={t.id} className={styles.team_card}>
                                <h2 
                                    className={styles.team_title_link}
                                    onClick={() => navigate(`/teams/${t.id}`)}
                                >
                                    {t.title}
                                </h2>
                                <p>{t.description}</p>
                                <p><strong>Создатель:</strong> 
                                    <span 
                                        className={styles.creator_link}
                                        onClick={() => navigate(`/users/${t.creator}`)}
                                    >
                                        @{t.creator}
                                    </span>
                                </p>
                                <p><strong>Категория:</strong> {t.category}</p>
                                <p><strong>Статус:</strong> {t.status}</p>
                                <div className={styles.team_tags}>
                                    {t.required_skills?.map((skill, i) => (
                                        <span key={i} className={styles.tag}>{skill}</span>
                                    ))}
                                </div>
                                <div className={styles.team_tags}>
                                    {t.required_qualities?.map((q, i) => (
                                        <span key={i} className={styles.tag_quality}>{q}</span>
                                    ))}
                                </div>
                                <ul>
                                    {t.members?.map((m) => (
                                        <li key={m.id}>{m.user}</li>
                                    ))}
                                </ul>
                                <span className={styles.created_at}>
                                    Создано: {new Date(t.created_at).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <InviteUserModal
                team={selectedTeam}
                isOpen={isInviteModalOpen}
                onClose={handleCloseInviteModal}
                onSuccess={handleInviteSuccess}
            />
        </div>
    );
}


