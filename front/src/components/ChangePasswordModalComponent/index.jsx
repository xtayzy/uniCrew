import { useState } from "react";
import styles from "./style.module.css";
import { changePassword } from "../../api/auth.js";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePasswordModalComponent({ access, onClose }) {
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd1, setNewPwd1] = useState("");
    const [newPwd2, setNewPwd2] = useState("");
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd1, setShowNewPwd1] = useState(false);
    const [showNewPwd2, setShowNewPwd2] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        if (newPwd1 !== newPwd2) {
            setError("Новые пароли не совпадают");
            return;
        }
        try {
            setLoading(true);
            const res = await changePassword(oldPwd, newPwd1, newPwd2, access);
            setMessage(res.message || "Пароль успешно изменен");
            setOldPwd("");
            setNewPwd1("");
            setNewPwd2("");
        } catch (err) {
            setError(err.message || "Ошибка смены пароля");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h3>Смена пароля</h3>
                <form onSubmit={handleSubmit}>
                    <label>Старый пароль</label>
                    <label className={styles.password}>
                        <input
                            type={showOldPwd ? "text" : "password"}
                            name="oldPassword"
                            value={oldPwd}
                            onChange={(e) => setOldPwd(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.toggle_visibility}
                            onClick={(e) => {
                                e.preventDefault();
                                setShowOldPwd(!showOldPwd);
                            }}
                            disabled={loading}
                            tabIndex={-1}
                            title="Переключить видимость пароля"
                        >
                            <span>{showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}</span>
                        </button>
                    </label>
                    <label>Новый пароль</label>
                    <label className={styles.password}>
                        <input
                            type={showNewPwd1 ? "text" : "password"}
                            name="newPassword1"
                            value={newPwd1}
                            onChange={(e) => setNewPwd1(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.toggle_visibility}
                            onClick={(e) => {
                                e.preventDefault();
                                setShowNewPwd1(!showNewPwd1);
                            }}
                            disabled={loading}
                            tabIndex={-1}
                            title="Переключить видимость пароля"
                        >
                            <span>{showNewPwd1 ? <EyeOff size={18} /> : <Eye size={18} />}</span>
                        </button>
                    </label>
                    <label>Повторите новый пароль</label>
                    <label className={styles.password}>
                        <input
                            type={showNewPwd2 ? "text" : "password"}
                            name="newPassword2"
                            value={newPwd2}
                            onChange={(e) => setNewPwd2(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.toggle_visibility}
                            onClick={(e) => {
                                e.preventDefault();
                                setShowNewPwd2(!showNewPwd2);
                            }}
                            disabled={loading}
                            tabIndex={-1}
                            title="Переключить видимость пароля"
                        >
                            <span>{showNewPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}</span>
                        </button>
                    </label>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {message && <p style={{ color: "green" }}>{message}</p>}
                    <div className={styles.buttons}>
                        <button type="submit" disabled={loading}>
                            {loading ? "Сохранение..." : "Сменить"}
                        </button>
                        <button type="button" onClick={onClose}>
                            Закрыть
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


