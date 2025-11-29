import { useState } from "react";
import axios from "axios";
import styles from "./style.module.css";
import { API_URL } from "../../config.js";
import { useAuth } from "../../hooks/useAuth";

const JoinTeamModal = ({ team, isOpen, onClose, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { tokens } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            alert('Пожалуйста, напишите сообщение');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}teams/${team.id}/join/`, {
                message: message.trim()
            }, {
                headers: {
                    'Authorization': `Bearer ${tokens.access}`
                }
            });
            
            onSuccess('Заявка на вступление отправлена!');
            setMessage('');
            onClose();
        } catch (error) {
            console.error('Ошибка при отправке заявки:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Произошла ошибка при отправке заявки');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h3>Подать заявку на вступление</h3>
                    <button className={styles.close_btn} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.team_info}>
                    <h4>{team.title}</h4>
                    <p>{team.description}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_group}>
                        <label htmlFor="message">
                            Сообщение для создателя команды:
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Расскажите о себе, своих навыках и почему хотите присоединиться к команде..."
                            className={styles.textarea}
                            rows={4}
                            required
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
                            disabled={loading}
                        >
                            {loading ? 'Отправка...' : 'Отправить заявку'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinTeamModal;
