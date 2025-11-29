import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./style.module.css";
import LoadingSpinner from "../LoadingSpinner";
import { API_URL } from "../../config.js";
import { useAuth } from "../../hooks/useAuth";

const TaskTracker = ({ team, currentUser, isTeamCreator }) => {
    const { tokens } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);

    // Форма для создания/редактирования задачи
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'MEDIUM',
        due_date: ''
    });

    const fetchTasks = useCallback(async () => {
        if (!team?.id) return;
        try {
            const response = await axios.get(`${API_URL}teams/${team.id}/tasks/`, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        } finally {
            setLoading(false);
        }
    }, [team?.id, tokens]);

    const fetchTeamMembers = useCallback(async () => {
        if (!team?.id) return;
        try {
            const response = await axios.get(`${API_URL}teams/${team.id}/members/`, {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });
            setTeamMembers(response.data.filter(member => member.status === 'APPROVED'));
        } catch (error) {
            console.error('Ошибка загрузки участников:', error);
        }
    }, [team?.id, tokens]);

    useEffect(() => {
        if (team && currentUser) {
            fetchTasks();
            if (isTeamCreator) {
                fetchTeamMembers();
            }
        }
    }, [team, currentUser, isTeamCreator, fetchTasks, fetchTeamMembers]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                assigned_to_username: formData.assigned_to || null,
                priority: formData.priority,
                due_date: formData.due_date || null
            };
            
            await axios.post(`${API_URL}teams/${team.id}/tasks/`, taskData, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`,
                    'Content-Type': 'application/json'
                }
            });
            setShowCreateModal(false);
            resetForm();
            fetchTasks();
            alert('Задача создана успешно!');
        } catch (error) {
            console.error('Ошибка создания задачи:', error);
            if (error.response?.data) {
                const errorMessage = error.response.data.detail || 
                                   error.response.data.assigned_to_username?.[0] ||
                                   'Ошибка при создании задачи';
                alert(errorMessage);
            } else {
                alert('Ошибка при создании задачи');
            }
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                assigned_to_username: formData.assigned_to || null,
                priority: formData.priority,
                due_date: formData.due_date || null
            };
            
            await axios.put(`${API_URL}teams/${team.id}/tasks/${editingTask.id}/`, taskData, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`,
                    'Content-Type': 'application/json'
                }
            });
            setEditingTask(null);
            resetForm();
            fetchTasks();
            alert('Задача обновлена успешно!');
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
            if (error.response?.data) {
                const errorMessage = error.response.data.detail || 
                                   error.response.data.assigned_to_username?.[0] ||
                                   'Ошибка при обновлении задачи';
                alert(errorMessage);
            } else {
                alert('Ошибка при обновлении задачи');
            }
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
            return;
        }
        try {
            await axios.delete(`${API_URL}teams/${team.id}/tasks/${taskId}/`, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            fetchTasks();
            alert('Задача удалена успешно!');
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
            alert('Ошибка при удалении задачи');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.patch(`${API_URL}teams/${team.id}/tasks/${taskId}/`, 
                { status: newStatus }, 
                {
                    headers: {
                        'Authorization': `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            fetchTasks();
        } catch (error) {
            console.error('Ошибка изменения статуса:', error);
            alert('Ошибка при изменении статуса задачи');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            assigned_to: '',
            priority: 'MEDIUM',
            due_date: ''
        });
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            assigned_to: task.assigned_to || '',
            priority: task.priority,
            due_date: task.due_date ? task.due_date.split('T')[0] : ''
        });
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setEditingTask(null);
        resetForm();
    };

    const getStatusColor = (status) => {
        const colors = {
            'TODO': '#6b7280',
            'IN_PROGRESS': '#f59e0b',
            'DONE': '#10b981',
            'CANCELLED': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': '#10b981',
            'MEDIUM': '#f59e0b',
            'HIGH': '#ef4444',
            'URGENT': '#dc2626'
        };
        return colors[priority] || '#f59e0b';
    };

    const getStatusDisplay = (status) => {
        const displays = {
            'TODO': 'К выполнению',
            'IN_PROGRESS': 'В работе',
            'DONE': 'Выполнено',
            'CANCELLED': 'Отменено'
        };
        return displays[status] || status;
    };

    const getPriorityDisplay = (priority) => {
        const displays = {
            'LOW': 'Низкий',
            'MEDIUM': 'Средний',
            'HIGH': 'Высокий',
            'URGENT': 'Срочный'
        };
        return displays[priority] || priority;
    };

    if (loading) {
        return <LoadingSpinner text="Загрузка задач..." />;
    }

    return (
        <div className={styles.task_tracker}>
            <div className={styles.header}>
                <h3>Трекер задач</h3>
                {isTeamCreator && (
                    <button 
                        className={styles.create_btn}
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Создать задачу
                    </button>
                )}
            </div>

            <div className={styles.tasks_list}>
                {tasks.length === 0 ? (
                    <div className={styles.no_tasks}>
                        <p>Задач пока нет</p>
                        {isTeamCreator && (
                            <p>Создайте первую задачу для команды</p>
                        )}
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className={styles.task_card}>
                            <div className={styles.task_header}>
                                <h4 className={styles.task_title}>{task.title}</h4>
                                <div className={styles.task_meta}>
                                    <span 
                                        className={styles.priority_badge}
                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                    >
                                        {getPriorityDisplay(task.priority)}
                                    </span>
                                    <span 
                                        className={styles.status_badge}
                                        style={{ backgroundColor: getStatusColor(task.status) }}
                                    >
                                        {getStatusDisplay(task.status)}
                                    </span>
                                </div>
                            </div>

                            {task.description && (
                                <p className={styles.task_description}>{task.description}</p>
                            )}

                            <div className={styles.task_info}>
                                <div className={styles.task_field}>
                                    <strong>Создатель:</strong> @{task.creator}
                                </div>
                                {task.assigned_to && (
                                    <div className={styles.task_field}>
                                        <strong>Исполнитель:</strong> @{task.assigned_to}
                                    </div>
                                )}
                                {task.due_date && (
                                    <div className={styles.task_field}>
                                        <strong>Срок:</strong> {new Date(task.due_date).toLocaleDateString('ru-RU')}
                                    </div>
                                )}
                                <div className={styles.task_field}>
                                    <strong>Создана:</strong> {new Date(task.created_at).toLocaleDateString('ru-RU')}
                                </div>
                            </div>

                            <div className={styles.task_actions}>
                                {/* Создатель может изменять все */}
                                {isTeamCreator && (
                                    <>
                                        <button 
                                            className={styles.edit_btn}
                                            onClick={() => openEditModal(task)}
                                        >
                                            Редактировать
                                        </button>
                                        <button 
                                            className={styles.delete_btn}
                                            onClick={() => handleDeleteTask(task.id)}
                                        >
                                            Удалить
                                        </button>
                                    </>
                                )}

                                {/* Участник может изменять только статус своих задач */}
                                {!isTeamCreator && task.assigned_to === currentUser.username && task.status !== 'DONE' && (
                                    <div className={styles.status_actions}>
                                        <button 
                                            className={styles.status_btn}
                                            onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                                        >
                                            В работу
                                        </button>
                                        <button 
                                            className={styles.status_btn}
                                            onClick={() => handleStatusChange(task.id, 'DONE')}
                                        >
                                            Выполнено
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Модальное окно создания/редактирования задачи */}
            {(showCreateModal || editingTask) && (
                <div className={styles.modal_overlay}>
                    <div className={styles.modal_content}>
                        <div className={styles.modal_header}>
                            <h3>{editingTask ? 'Редактировать задачу' : 'Создать задачу'}</h3>
                            <button className={styles.close_btn} onClick={closeModals}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask}>
                            <div className={styles.form_group}>
                                <label htmlFor="title">Название задачи *</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div className={styles.form_group}>
                                <label htmlFor="description">Описание</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                />
                            </div>

                            <div className={styles.form_group}>
                                <label htmlFor="assigned_to">Исполнитель</label>
                                <select
                                    id="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                                >
                                    <option value="">Не назначено</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.id} value={member.user}>
                                            @{member.user}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.form_group}>
                                <label htmlFor="priority">Приоритет</label>
                                <select
                                    id="priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="LOW">Низкий</option>
                                    <option value="MEDIUM">Средний</option>
                                    <option value="HIGH">Высокий</option>
                                    <option value="URGENT">Срочный</option>
                                </select>
                            </div>

                            <div className={styles.form_group}>
                                <label htmlFor="due_date">Срок выполнения</label>
                                <input
                                    type="date"
                                    id="due_date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                />
                            </div>

                            <div className={styles.form_actions}>
                                <button type="button" onClick={closeModals} className={styles.cancel_btn}>
                                    Отмена
                                </button>
                                <button type="submit" className={styles.submit_btn}>
                                    {editingTask ? "Сохранить" : "Создать"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskTracker;
