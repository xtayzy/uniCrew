import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotCredentials } from "../../api/auth.js";
import styles from "./style.module.css";
import LoadingSpinner from "../../components/LoadingSpinner/index.jsx";

function ForgotCredentialsPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);
        try {
            const res = await forgotCredentials(email);
            setMessage(res.message || "Письмо отправлено. Проверьте почту.");
        } catch (err) {
            setError(err.message || "Не удалось отправить письмо");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2>Восстановление пароля</h2>
            <p className={styles.subtitle}>Укажите email — отправим ваш логин и новый пароль.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} style={{ position: 'relative', minHeight: '40px' }}>
                    {isLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <LoadingSpinner size="small" text="" />
                            <span>Отправка...</span>
                        </span>
                    ) : "Отправить"}
                </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}
            <p className={styles.info}>
                Вспомнили? <Link to="/login">Войти</Link>
            </p>
        </div>
    );
}

export default ForgotCredentialsPage;


