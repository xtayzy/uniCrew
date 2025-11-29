import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./style.module.css";
import { API_URL } from "../../config.js";


export default function EditSkillsModalComponent({ profile, access, onClose, onSave }) {
    const [formData, setFormData] = useState({
        about_myself: profile.about_myself || "",
        skills: profile.skills_list || [],
        personal_qualities: profile.personal_qualities_list || [],
        newSkill: "",
        newQuality: "",
    });

    const [skillSuggestions, setSkillSuggestions] = useState([]);
    const [qualitySuggestions, setQualitySuggestions] = useState([]);

    // 🔹 Закрытие по клавише Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // 🔹 Автозагрузка подсказок
    useEffect(() => {
        const fetchSkills = async () => {
            if (formData.newSkill.trim().length < 1) {
                setSkillSuggestions([]);
                return;
            }
            try {
                const res = await axios.get(`${API_URL}skills/?q=${formData.newSkill}`);
                setSkillSuggestions(res.data);
            } catch (e) {
                console.error("Ошибка загрузки навыков:", e);
            }
        };

        const fetchQualities = async () => {
            if (formData.newQuality.trim().length < 1) {
                setQualitySuggestions([]);
                return;
            }
            try {
                const res = await axios.get(`${API_URL}personal-qualities/?q=${formData.newQuality}`);
                setQualitySuggestions(res.data);
            } catch (e) {
                console.error("Ошибка загрузки качеств:", e);
            }
        };

        fetchSkills();
        fetchQualities();
    }, [formData.newSkill, formData.newQuality]);

    // 🔹 Добавить навык вручную
    const handleAddSkill = () => {
        if (formData.newSkill && !formData.skills.includes(formData.newSkill)) {
            setFormData({
                ...formData,
                skills: [...formData.skills, formData.newSkill],
                newSkill: "",
            });
            setSkillSuggestions([]);
        }
    };

    // 🔹 Добавить из подсказки
    const handleSelectSkill = (name) => {
        setFormData((prev) => {
            if (prev.skills.includes(name)) {
                return { ...prev, newSkill: "" };
            }
            return {
                ...prev,
                skills: [...prev.skills, name],
                newSkill: "",
            };
        });
        setSkillSuggestions([]);
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((s) => s !== skillToRemove),
        }));
    };

    // 🔹 Добавить качество
    const handleAddQuality = () => {
        if (formData.newQuality && !formData.personal_qualities.includes(formData.newQuality)) {
            setFormData({
                ...formData,
                personal_qualities: [...formData.personal_qualities, formData.newQuality],
                newQuality: "",
            });
            setQualitySuggestions([]);
        }
    };

    // 🔹 Добавить качество из подсказки
    const handleSelectQuality = (name) => {
        setFormData((prev) => {
            if (prev.personal_qualities.includes(name)) {
                return { ...prev, newQuality: "" };
            }
            return {
                ...prev,
                personal_qualities: [...prev.personal_qualities, name],
                newQuality: "",
            };
        });
        setQualitySuggestions([]);
    };

    const handleRemoveQuality = (q) => {
        setFormData((prev) => ({
            ...prev,
            personal_qualities: prev.personal_qualities.filter((x) => x !== q),
        }));
    };

    // 🔹 Сохранить
    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append("about_myself", formData.about_myself);

            formData.skills.forEach((s) => data.append("skills", s));
            formData.personal_qualities.forEach((q) => data.append("personal_qualities", q));

            // 🔹 если у тебя будет input type="file" для аватара:
            if (formData.avatar instanceof File) {
                data.append("avatar", formData.avatar);
            }

            const res = await axios.put(`${API_URL}profile/`, data, {
                headers: {
                    Authorization: `Bearer ${access}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            onSave(res.data);
            onClose();
        } catch (e) {
            console.error("Ошибка сохранения:", e);
        }
    };


    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 🔹 НАВЫКИ */}
                <div className={styles.section}>
                    <div className={styles.title}>Навыки</div>
                    <div className={styles.tags}>
                        {formData.skills.map((s, i) => (
                            <span key={i} className={styles.tag} onClick={() => handleRemoveSkill(s)}>
                                {s} ✕
                            </span>
                        ))}
                    </div>
                    <div className={styles.inputWrapper}>
                        <input
                            value={formData.newSkill}
                            onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                            placeholder="Добавить навык"
                        />

                        {/* 🔹 Кнопка закрытия подсказок */}
                        {skillSuggestions.length > 0 && (
                            <button
                                className={styles.closeSuggestions}
                                onClick={() => setSkillSuggestions([])}
                                type="button"
                            >
                                ✕
                            </button>
                        )}

                        {skillSuggestions.length > 0 && (
                            <ul className={styles.suggestions}>
                                {skillSuggestions.map((s) => (
                                    <li key={s.id} onClick={() => handleSelectSkill(s.name)}>
                                        {s.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button onClick={handleAddSkill}>Добавить</button>
                </div>

                {/* 🔹 КАЧЕСТВА */}
                <div className={styles.section}>
                    <div className={styles.title}>Личные качества</div>
                    <div className={styles.tags}>
                        {formData.personal_qualities.map((q, i) => (
                            <span key={i} className={styles.tag} onClick={() => handleRemoveQuality(q)}>
                                {q} ✕
                            </span>
                        ))}
                    </div>
                    <div className={styles.inputWrapper}>
                        <input
                            value={formData.newQuality}
                            onChange={(e) => setFormData({ ...formData, newQuality: e.target.value })}
                            placeholder="Добавить качество"
                        />

                        {qualitySuggestions.length > 0 && (
                            <button
                                className={styles.closeSuggestions}
                                onClick={() => setQualitySuggestions([])}
                                type="button"
                            >
                                ✕
                            </button>
                        )}

                        {qualitySuggestions.length > 0 && (
                            <ul className={styles.suggestions}>
                                {qualitySuggestions.map((q) => (
                                    <li key={q.id} onClick={() => handleSelectQuality(q.name)}>
                                        {q.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button onClick={handleAddQuality}>Добавить</button>
                </div>

                {/* 🔹 О СЕБЕ */}
                <div className={styles.title}>О себе</div>
                <textarea
                    value={formData.about_myself}
                    onChange={(e) => setFormData({ ...formData, about_myself: e.target.value })}
                />

                <div className={styles.buttons}>
                    <button onClick={handleSave}>Сохранить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
}
