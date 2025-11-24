import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './style.module.css';
import { AuthContext } from '../../context/AuthContext';

const InviteUserModal = ({ team, isOpen, onClose, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const { tokens } = React.useContext(AuthContext);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = users.filter(user => 
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredUsers(filtered.slice(0, 10)); // Ограничиваем до 10 результатов
        } else {
            setFilteredUsers([]);
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/users/', {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            alert('Пожалуйста, выберите пользователя');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`http://127.0.0.1:8000/api/teams/${team.id}/invite/`, {
                user_id: selectedUser.id,
                message: message.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            
            onSuccess(`Приглашение отправлено пользователю ${selectedUser.username}!`);
            setMessage('');
            setSelectedUser(null);
            setSearchQuery('');
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

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSearchQuery(user.username);
        setFilteredUsers([]);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h3>Пригласить пользователя</h3>
                    <button className={styles.close_btn} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.team_info}>
                    <h4>{team.title}</h4>
                    <p>{team.description}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_group}>
                        <label htmlFor="user-search">
                            Выберите пользователя:
                        </label>
                        <div className={styles.search_container}>
                            <input
                                id="user-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Введите имя пользователя..."
                                className={styles.search_input}
                            />
                            {filteredUsers.length > 0 && (
                                <div className={styles.search_results}>
                                    {filteredUsers.map((user) => (
                                        <div 
                                            key={user.id}
                                            className={styles.user_option}
                                            onClick={() => handleUserSelect(user)}
                                        >
                                            <div className={styles.user_info}>
                                                <span className={styles.username}>{user.username}</span>
                                                {(user.first_name || user.last_name) && (
                                                    <span className={styles.full_name}>
                                                        {user.first_name} {user.last_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedUser && (
                            <div className={styles.selected_user}>
                                <span>Выбран: <strong>{selectedUser.username}</strong></span>
                                <button 
                                    type="button"
                                    className={styles.clear_selection}
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setSearchQuery('');
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        )}
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
                            disabled={loading || !selectedUser}
                        >
                            {loading ? 'Отправка...' : 'Отправить приглашение'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteUserModal;
