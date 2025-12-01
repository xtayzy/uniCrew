import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./style.module.css";
import { API_URL } from "@/config";
import { useAuth } from "../../hooks/useAuth";

const ManageMembersModal = ({ team, isOpen, onClose, onUpdate }) => {
    const { tokens } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchMembers = useCallback(async () => {
        if (!team?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}teams/${team.id}/members/`, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            setMembers(response.data);
        } catch (error) {
            console.error("Ошибка загрузки участников:", error);
        } finally {
            setLoading(false);
        }
    }, [team?.id, tokens]);

    useEffect(() => {
        if (isOpen && team) {
            fetchMembers();
        }
    }, [isOpen, team, fetchMembers]);

    const handleStatusChange = async (memberId, newStatus) => {
        setActionLoading(memberId);
        try {
            await axios.put(
                `${API_URL}teams/${team.id}/members/${memberId}/`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${tokens?.access}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            
            // Обновляем локальное состояние
            setMembers(prev => prev.map(member => 
                member.id === memberId ? { ...member, status: newStatus } : member
            ));
            
            // Уведомляем родительский компонент об обновлении
            onUpdate();
        } catch (error) {
            console.error("Ошибка изменения статуса:", error);
            alert("Ошибка при изменении статуса участника");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveMember = async (memberId, userName) => {
        if (!window.confirm(`Вы уверены, что хотите удалить участника ${userName} из команды?`)) {
            return;
        }

        setActionLoading(memberId);
        try {
            // Найдем member по ID чтобы получить user_id
            const member = members.find(m => m.id === memberId);
            if (!member) {
                alert("Участник не найден");
                return;
            }

            await axios.delete(
                `${API_URL}teams/${team.id}/remove-member/${member.user_id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens?.access}`,
                    },
                }
            );
            
            // Удаляем из локального состояния
            setMembers(prev => prev.filter(member => member.id !== memberId));
            
            // Уведомляем родительский компонент об обновлении
            onUpdate();
        } catch (error) {
            console.error('Ошибка удаления участника:', error);
            alert('Ошибка при удалении участника');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            'PENDING': 'Ожидание',
            'INVITED': 'Приглашен',
            'APPROVED': 'Участник',
            'REJECTED': 'Отклонён'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'PENDING': '#f59e0b',
            'INVITED': '#3b82f6',
            'APPROVED': '#10b981',
            'REJECTED': '#ef4444'
        };
        return colorMap[status] || '#6b7280';
    };

    const canChangeStatus = (member) => {
        return member.status === 'PENDING' || member.status === 'INVITED';
    };

    const canRemove = (member) => {
        return member.status === 'APPROVED' || member.status === 'REJECTED';
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_overlay}>
            <div className={styles.modal_content}>
                <div className={styles.modal_header}>
                    <h2>Управление участниками</h2>
                    <button className={styles.close_btn} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modal_body}>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Загрузка участников...</p>
                        </div>
                    ) : (
                        <div className={styles.members_list}>
                            {members.length === 0 ? (
                                <div className={styles.no_members}>
                                    <p>Участники не найдены</p>
                                </div>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className={styles.member_card}>
                                        <div className={styles.member_info}>
                                            <div className={styles.member_name}>
                                                @{member.user}
                                            </div>
                                            <div 
                                                className={styles.member_status}
                                                style={{ backgroundColor: getStatusColor(member.status) }}
                                            >
                                                {getStatusDisplay(member.status)}
                                            </div>
                                        </div>
                                        
                                        {member.message && (
                                            <div className={styles.member_message}>
                                                <strong>Сообщение:</strong> {member.message}
                                            </div>
                                        )}
                                        
                                        <div className={styles.member_actions}>
                                            {canChangeStatus(member) && (
                                                <div className={styles.status_actions}>
                                                    {member.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                className={styles.approve_btn}
                                                                onClick={() => handleStatusChange(member.id, 'APPROVED')}
                                                                disabled={actionLoading === member.id}
                                                            >
                                                                {actionLoading === member.id ? '...' : 'Принять'}
                                                            </button>
                                                            <button
                                                                className={styles.reject_btn}
                                                                onClick={() => handleStatusChange(member.id, 'REJECTED')}
                                                                disabled={actionLoading === member.id}
                                                            >
                                                                {actionLoading === member.id ? '...' : 'Отклонить'}
                                                            </button>
                                                        </>
                                                    )}
                                                    {member.status === 'INVITED' && (
                                                        <button
                                                            className={styles.cancel_invite_btn}
                                                            onClick={() => handleStatusChange(member.id, 'REJECTED')}
                                                            disabled={actionLoading === member.id}
                                                        >
                                                            {actionLoading === member.id ? '...' : 'Отменить приглашение'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {canRemove(member) && (
                                                <button
                                                    className={styles.remove_btn}
                                                    onClick={() => handleRemoveMember(member.id, member.user)}
                                                    disabled={actionLoading === member.id}
                                                >
                                                    {actionLoading === member.id ? '...' : 'Удалить'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.modal_footer}>
                    <button onClick={onClose} className={styles.close_modal_btn}>
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageMembersModal;
