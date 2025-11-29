import { useState, useEffect } from "react";
import axios from 'axios';
import styles from './style.module.css';
import { API_URL } from '@/config';

const EditTeamModal = ({ team, isOpen, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        status: 'OPEN',
        required_skills: [],
        required_qualities: [],
        whatsapp_link: '',
        telegram_link: ''
    });
    const [categories, setCategories] = useState([]);
    const [skills, setSkills] = useState([]);
    const [qualities, setQualities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && team) {
            setFormData({
                title: team.title || '',
                description: team.description || '',
                category: team.category || '',
                status: team.status || 'OPEN',
                required_skills: team.required_skills || [],
                required_qualities: team.required_qualities || [],
                whatsapp_link: team.whatsapp_link || '',
                telegram_link: team.telegram_link || ''
            });
        }
    }, [isOpen, team]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [categoriesRes, skillsRes, qualitiesRes] = await Promise.all([
                axios.get(`${API_URL}project-categories/`),
                axios.get(`${API_URL}skills/`),
                axios.get(`${API_URL}personal-qualities/`)
            ]);
            
            setCategories(categoriesRes.data);
            setSkills(skillsRes.data);
            setQualities(qualitiesRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onUpdate(formData);
        } catch (error) {
            console.error('Ошибка обновления команды:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal_overlay}>
            <div className={styles.modal_content}>
                <div className={styles.modal_header}>
                    <h2>Редактировать команду</h2>
                    <button className={styles.close_btn} onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.form_group}>
                        <label htmlFor="title">Название команды</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.form_group}>
                        <label htmlFor="description">Описание</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            required
                        />
                    </div>

                    <div className={styles.form_group}>
                        <label htmlFor="category">Категория</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.form_group}>
                        <label htmlFor="status">Статус</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="OPEN">Открыт набор</option>
                            <option value="CLOSED">Набор закрыт</option>
                            <option value="IN_PROGRESS">В работе</option>
                            <option value="DONE">Завершён</option>
                        </select>
                    </div>

                    <div className={styles.form_group}>
                        <label htmlFor="whatsapp_link">Ссылка на WhatsApp группу</label>
                        <input
                            type="url"
                            id="whatsapp_link"
                            name="whatsapp_link"
                            value={formData.whatsapp_link}
                            onChange={handleInputChange}
                            placeholder="https://chat.whatsapp.com/..."
                        />
                    </div>

                    <div className={styles.form_group}>
                        <label htmlFor="telegram_link">Ссылка на Telegram группу</label>
                        <input
                            type="url"
                            id="telegram_link"
                            name="telegram_link"
                            value={formData.telegram_link}
                            onChange={handleInputChange}
                            placeholder="https://t.me/..."
                        />
                    </div>

                    <div className={styles.form_group}>
                        <label>Требуемые навыки</label>
                        <div className={styles.checkbox_group}>
                            {skills.map(skill => (
                                <label key={skill.id} className={styles.checkbox_item}>
                                    <input
                                        type="checkbox"
                                        checked={formData.required_skills.includes(skill.name)}
                                        onChange={(e) => {
                                            const newSkills = e.target.checked
                                                ? [...formData.required_skills, skill.name]
                                                : formData.required_skills.filter(s => s !== skill.name);
                                            handleArrayChange("required_skills", newSkills);
                                        }}
                                    />
                                    <span>{skill.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.form_group}>
                        <label>Требуемые качества</label>
                        <div className={styles.checkbox_group}>
                            {qualities.map(quality => (
                                <label key={quality.id} className={styles.checkbox_item}>
                                    <input
                                        type="checkbox"
                                        checked={formData.required_qualities.includes(quality.name)}
                                        onChange={(e) => {
                                            const newQualities = e.target.checked
                                                ? [...formData.required_qualities, quality.name]
                                                : formData.required_qualities.filter(q => q !== quality.name);
                                            handleArrayChange("required_qualities", newQualities);
                                        }}
                                    />
                                    <span>{quality.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.form_actions}>
                        <button type="button" onClick={onClose} className={styles.cancel_btn}>
                            Отмена
                        </button>
                        <button type="submit" disabled={loading} className={styles.submit_btn}>
                            {loading ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTeamModal;
