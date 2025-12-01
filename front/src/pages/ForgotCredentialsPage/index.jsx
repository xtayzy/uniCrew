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
            {error && <p className={styles.error_message}>{error}</p>}
            {message && <p className={styles.success_message}>{message}</p>}
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
                <button type="submit" disabled={isLoading} className={styles.submit_button}>
                    {isLoading ? (
                        <span className={styles.loading_content}>
                            <LoadingSpinner size="small" text="" fullScreen={false} />
                            <span>Отправка...</span>
                        </span>
                    ) : "Отправить"}
                </button>
            </form>
            <p className={styles.info}>
                Вспомнили? <Link to="/login">Войти</Link>
            </p>
        </div>
    );
}

export default ForgotCredentialsPage;


