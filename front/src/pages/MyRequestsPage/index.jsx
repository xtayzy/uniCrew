import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const MyRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { tokens } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setError(null);
            const response = await axios.get('http://127.0.0.1:8000/api/users/my_requests/', {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            setRequests(response.data);
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (memberId) => {
        if (!window.confirm('Вы уверены, что хотите отменить заявку?')) {
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/users/cancel_request/', {
                member_id: memberId
            }, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            
            // Обновляем список заявок
            fetchRequests();
        } catch (error) {
            console.error('Ошибка при отмене заявки:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при отмене заявки');
            }
        }
    };

    const handleViewTeam = (teamId) => {
        navigate(`/teams/${teamId}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (error) {
        return (
            <div className={styles.container} style={{ padding: '40px 20px' }}>
                <ErrorDisplay
                    error={error}
                    title="Ошибка загрузки заявок"
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        fetchRequests();
                    }}
                    fullScreen={false}
                />
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner fullScreen={true} text="Загрузка заявок..." />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Мои заявки на вступление</h1>
                <p>Здесь отображаются все ваши заявки на вступление в команды</p>
            </div>

            {requests.length === 0 ? (
                <div className={styles.empty_state}>
                    <div className={styles.empty_icon}>📝</div>
                    <h3>У вас нет активных заявок</h3>
                    <p>Вы еще не подавали заявки на вступление в команды</p>
                    <button 
                        className={styles.browse_teams_btn}
                        onClick={() => navigate('/teams')}
                    >
                        Посмотреть команды
                    </button>
                </div>
            ) : (
                <div className={styles.requests_list}>
                    {requests.map((request) => (
                        <div key={request.id} className={styles.request_card}>
                            <div className={styles.request_header}>
                                <h3 
                                    className={styles.team_title}
                                    onClick={() => handleViewTeam(request.team)}
                                >
                                    {request.team_title}
                                </h3>
                                <span className={styles.status}>Ожидает рассмотрения</span>
                            </div>
                            
                            <div className={styles.request_body}>
                                {request.message && (
                                    <div className={styles.message}>
                                        <strong>Ваше сообщение:</strong>
                                        <p>{request.message}</p>
                                    </div>
                                )}
                                
                                <div className={styles.request_info}>
                                    <span className={styles.date}>
                                        Подана: {formatDate(request.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.request_actions}>
                                <button 
                                    className={styles.view_team_btn}
                                    onClick={() => handleViewTeam(request.team)}
                                >
                                    👁️ Посмотреть команду
                                </button>
                                <button 
                                    className={styles.cancel_btn}
                                    onClick={() => handleCancelRequest(request.id)}
                                >
                                    ❌ Отменить заявку
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRequestsPage;
