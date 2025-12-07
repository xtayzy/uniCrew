import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./style.module.css";
import { API_URL } from "@/config";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const AdminPage = () => {
    const { tokens } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('teams');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!tokens?.access) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_URL}admin-panel/`, {
                    headers: {
                        Authorization: `Bearer ${tokens.access}`,
                    },
                });
                setTeams(response.data.teams || []);
                setUsers(response.data.users || []);
                setError(null);
            } catch (err) {
                if (err.response?.status === 403) {
                    setError({ message: 'Доступ запрещен. Только администраторы могут просматривать эту страницу.', status: 403 });
                } else {
                    setError(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tokens]);

    const handleDelete = async (type, id, name) => {
        if (!window.confirm(`Вы уверены, что хотите удалить ${type === 'team' ? 'команду' : 'пользователя'} "${name}"? Это действие необратимо.`)) {
            return;
        }

        setDeleting({ type, id });
        try {
            await axios.delete(`${API_URL}admin-panel/`, {
                headers: {
                    Authorization: `Bearer ${tokens.access}`,
                },
                data: {
                    type,
                    id,
                },
            });

            if (type === 'team') {
                setTeams(prev => prev.filter(team => team.id !== id));
            } else {
                setUsers(prev => prev.filter(user => user.id !== id));
            }

            alert(`${type === 'team' ? 'Команда' : 'Пользователь'} успешно удален`);
        } catch (err) {
            if (err.response?.data?.error) {
                alert(err.response.data.error);
            } else {
                alert('Произошла ошибка при удалении');
            }
        } finally {
            setDeleting(null);
        }
    };

    if (error) {
        return (
            <div className={styles.admin_page}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка доступа"
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
        return <LoadingSpinner text="Загрузка данных..." />;
    }

    return (
        <div className={styles.admin_page}>
            <div className={styles.admin_header}>
                <h1>Панель администратора</h1>
                <button className={styles.back_btn} onClick={() => navigate('/')}>
                    ← Назад
                </button>
            </div>

            <div className={styles.stats}>
                <div className={styles.stat_card}>
                    <div className={styles.stat_value}>{teams.length}</div>
                    <div className={styles.stat_label}>Команд</div>
                </div>
                <div className={styles.stat_card}>
                    <div className={styles.stat_value}>{users.length}</div>
                    <div className={styles.stat_label}>Пользователей</div>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'teams' ? styles.active : ''}`}
                    onClick={() => setActiveTab('teams')}
                >
                    Команды ({teams.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Пользователи ({users.length})
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'teams' && (
                    <div className={styles.table_container}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Создатель</th>
                                    <th>Категория</th>
                                    <th>Статус</th>
                                    <th>Дата создания</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className={styles.empty}>Нет команд</td>
                                    </tr>
                                ) : (
                                    teams.map((team) => (
                                        <tr key={team.id}>
                                            <td>{team.id}</td>
                                            <td>{team.title}</td>
                                            <td>{typeof team.creator === 'string' ? team.creator : team.creator?.username || 'N/A'}</td>
                                            <td>{typeof team.category === 'string' ? team.category : team.category?.name || 'N/A'}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[team.status?.toLowerCase()] || ''}`}>
                                                    {team.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td>{team.created_at ? new Date(team.created_at).toLocaleDateString('ru-RU') : 'N/A'}</td>
                                            <td>
                                                <button
                                                    className={styles.delete_btn}
                                                    onClick={() => handleDelete('team', team.id, team.title)}
                                                    disabled={deleting?.type === 'team' && deleting?.id === team.id}
                                                >
                                                    {deleting?.type === 'team' && deleting?.id === team.id ? 'Удаление...' : 'Удалить'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className={styles.table_container}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Имя</th>
                                    <th>Факультет</th>
                                    <th>Дата регистрации</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className={styles.empty}>Нет пользователей</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>@{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'N/A'}</td>
                                            <td>{user.faculty?.name || 'N/A'}</td>
                                            <td>{user.date_joined ? new Date(user.date_joined).toLocaleDateString('ru-RU') : 'N/A'}</td>
                                            <td>
                                                <button
                                                    className={styles.delete_btn}
                                                    onClick={() => handleDelete('user', user.id, user.username)}
                                                    disabled={deleting?.type === 'user' && deleting?.id === user.id}
                                                >
                                                    {deleting?.type === 'user' && deleting?.id === user.id ? 'Удаление...' : 'Удалить'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;

