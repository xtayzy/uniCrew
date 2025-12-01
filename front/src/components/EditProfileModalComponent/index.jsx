import { useState, useEffect } from "react";
import ChangePasswordModalComponent from "../ChangePasswordModalComponent/index.jsx";
import axios from "axios";
import styles from "./style.module.css";
import { API_URL } from "../../config.js";


export default function EditProfileModalComponent({ profile, access, onClose, onSave }) {
    const [formData, setFormData] = useState({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        faculty_id: profile.faculty?.id || "",
        course: profile.course || "",
        education_level: profile.education_level || "",
        position: profile.position || "",
        avatar: null,
    });

    const [faculties, setFaculties] = useState([]);
    const [showPwdModal, setShowPwdModal] = useState(false);
    const [educationLevels] = useState([
        { value: "BACHELOR", label: "Бакалавриат" },
        { value: "MASTER", label: "Магистратура" },
        { value: "PHD", label: "Докторантура" },
          { value: "OTHER", label: "Другое" },
    ]);

    useEffect(() => {
        axios
            .get(`${API_URL}faculties/`, {
                headers: { Authorization: `Bearer ${access}` },
            })
            .then((res) => setFaculties(res.data))
            .catch((e) => console.error("Ошибка загрузки факультетов:", e));
    }, [access]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Выбран файл аватара:", file.name, file.size, file.type);
            setFormData({ ...formData, avatar: file });
        }
    };

    const handleSave = async () => {
        console.log("=== НАЧАЛО СОХРАНЕНИЯ ПРОФИЛЯ ===");
        console.log("formData.avatar:", formData.avatar);
        try {
            const data = new FormData();
            // добавляем обновляемые поля
            data.append("first_name", formData.first_name);
            data.append("last_name", formData.last_name);
            if (formData.faculty_id) data.append("faculty_id", formData.faculty_id);
            if (formData.course) data.append("course", formData.course);
            if (formData.education_level) data.append("education_level", formData.education_level);
            if (formData.position) data.append("position", formData.position);
            if (formData.avatar) {
                console.log("Отправляю аватар:", formData.avatar.name, formData.avatar.size, formData.avatar.type);
                // Убеждаемся, что файл добавляется правильно
                data.append("avatar_file", formData.avatar, formData.avatar.name);
            } else {
                console.log("Аватар не выбран");
            }

            // 🔥 добавляем неизменённые данные, чтобы ничего не стерлось
            if (profile.skills) data.append("skills", JSON.stringify(profile.skills));
            if (profile.personal_qualities) data.append("personal_qualities", JSON.stringify(profile.personal_qualities));
            if (profile.about_myself) data.append("about_myself", profile.about_myself);

            // Проверяем содержимое FormData перед отправкой
            console.log("FormData содержимое:");
            for (let pair of data.entries()) {
                console.log(pair[0], pair[1]);
            }

            const res = await axios.patch(`${API_URL}profile/`, data, {
                headers: {
                    Authorization: `Bearer ${access}`,
                    // Не устанавливаем Content-Type - браузер сам установит с boundary
                },
            });

            console.log("Ответ сервера:", res.data);
            onSave(res.data);
            onClose();
        } catch (e) {
            console.error("Ошибка сохранения профиля:", e);
            if (e.response) {
                console.error("Детали ошибки:", e.response.data);
            }
        }
    };

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Редактировать профиль</h3>
                <div>
                    <button type="button" onClick={() => setShowPwdModal(true)}>
                        Сменить пароль
                    </button>
                </div>

                <label>Имя:</label>
                <input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />

                <label>Фамилия:</label>
                <input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />

                <label>Факультет:</label>
                <select
                    value={formData.faculty_id}
                    onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                >
                    <option value="">— Не выбрано —</option>
                    {faculties.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.name} ({f.school_name})
                        </option>
                    ))}
                </select>

                <label>Курс:</label>
                <input
                    type="number"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />

                <label>Уровень образования:</label>
                <select
                    value={formData.education_level || ""}
                    onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                >
                    <option value="">— Не выбрано —</option>
                    {educationLevels.map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>
                            {lvl.label}
                        </option>
                    ))}
                </select>

                <label>Должность:</label>
                <input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />

                <label>Аватар:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />

                <div className={styles.buttons}>
                    <button onClick={handleSave}>Сохранить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
            {showPwdModal && (
                <ChangePasswordModalComponent
                    access={access}
                    onClose={() => setShowPwdModal(false)}
                />
            )}
        </div>
    );
}
