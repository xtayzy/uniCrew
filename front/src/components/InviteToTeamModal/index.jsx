import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import styles from './style.module.css';
import { AuthContext } from '../../context/AuthContext';

const InviteToTeamModal = ({ user, isOpen, onClose, onSuccess }) => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { tokens } = useContext(AuthContext);

    useEffect(() => {
        if (isOpen) {
            fetchUserTeams();
        }
    }, [isOpen]);

    const fetchUserTeams = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            
            const username = response.data.username;
            const teamsResponse = await axios.get(`http://127.0.0.1:8000/api/teams/?creator_name=${encodeURIComponent(username)}`, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            
            // Фильтруем команды, где пользователь уже является участником
            const filteredTeams = (teamsResponse.data || []).filter(team => {
                return !team.members.some(member => member.user === user.username);
            });
            
            setTeams(filteredTeams);
        } catch (error) {
            console.error('Ошибка загрузки команд:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTeam) {
            alert('Пожалуйста, выберите команду');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`http://127.0.0.1:8000/api/teams/${selectedTeam.id}/invite/`, {
                user_id: user.id,
                message: message.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            
            onSuccess(`Приглашение отправлено пользователю ${user.username} в команду "${selectedTeam.title}"!`);
            setMessage('');
            setSelectedTeam(null);
            onClose();
        } catch (error) {
            console.error('Ошибка при отправке приглашения:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при отправке приглашения');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTeamSelect = (team) => {
        setSelectedTeam(team);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h3>Пригласить пользователя в команду</h3>
                    <button className={styles.close_btn} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.user_info}>
                    <h4>Приглашаем пользователя:</h4>
                    <div className={styles.user_card}>
                        <div className={styles.user_avatar}>
                            <img
                                src={user.avatar || "https://www.iccaconsortium.org/wp-content/uploads/2017/05/blank-profile-picture-973460_1280.png"}
                                alt="Аватар"
                            />
                        </div>
                        <div className={styles.user_details}>
                            <div className={styles.user_name}>@{user.username}</div>
                            <div className={styles.user_full_name}>
                                {user.first_name && user.last_name ? 
                                    `${user.first_name} ${user.last_name}` : 
                                    'Имя не указано'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_group}>
                        <label htmlFor="team-select">
                            Выберите команду:
                        </label>
                        <div className={styles.teams_list}>
                            {teams.length === 0 ? (
                                <div className={styles.no_teams}>
                                    <p>Нет доступных команд для приглашения</p>
                                    <p className={styles.hint}>Пользователь уже является участником всех ваших команд или у вас нет команд</p>
                                </div>
                            ) : (
                                teams.map((team) => (
                                    <div 
                                        key={team.id}
                                        className={`${styles.team_option} ${selectedTeam?.id === team.id ? styles.selected : ''}`}
                                        onClick={() => handleTeamSelect(team)}
                                    >
                                        <div className={styles.team_info}>
                                            <div className={styles.team_title}>{team.title}</div>
                                            <div className={styles.team_description}>
                                                {team.description.length > 100 ? 
                                                    `${team.description.substring(0, 100)}...` : 
                                                    team.description
                                                }
                                            </div>
                                            <div className={styles.team_meta}>
                                                <span className={styles.team_category}>{team.category}</span>
                                                <span className={styles.team_status}>{team.status}</span>
                                            </div>
                                        </div>
                                        <div className={styles.team_members_count}>
                                            {team.members?.length || 0} участников
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={styles.form_group}>
                        <label htmlFor="message">
                            Сообщение для пользователя (необязательно):
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Напишите сообщение для пользователя..."
                            className={styles.textarea}
                            rows={3}
                        />
                    </div>

                    <div className={styles.form_actions}>
                        <button 
                            type="button" 
                            className={styles.cancel_btn}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submit_btn}
                            disabled={loading || !selectedTeam || teams.length === 0}
                        >
                            {loading ? 'Отправка...' : 'Отправить приглашение'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteToTeamModal;
