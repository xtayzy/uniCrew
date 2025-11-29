import { useState, useEffect } from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import { Link } from "react-router-dom";
import styles from './style.module.css'
import {login} from "../../api/auth.js";
import LoadingSpinner from "../../components/LoadingSpinner/index.jsx";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import { API_URL } from "../../config.js";

function LogInPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login_context } = useAuth();
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite");

    useEffect(() => {
        if (inviteToken) {
            localStorage.setItem("pending_invite_token", inviteToken);
        }
    }, [inviteToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { access, refresh } = await login(username, password);
            login_context(access, refresh);
            
            // Проверяем, есть ли pending invite token
            const pendingInvite = localStorage.getItem("pending_invite_token");
            if (pendingInvite) {
                try {
                    const response = await axios.post(`${API_URL}teams/invite/`, { token: pendingInvite }, {
                        headers: { Authorization: `Bearer ${access}` }
                    });
                    localStorage.removeItem("pending_invite_token");
                    if (response.data.team_id) {
                        navigate(`/teams/${response.data.team_id}`);
                    } else {
                        navigate("/my-teams");
                    }
                    return;
                } catch (inviteErr) {
                    console.error("Ошибка при вступлении по приглашению:", inviteErr);
                    // Продолжаем обычный переход, если ошибка
                }
            }
            
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Неверный логин или пароль");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.main_block}>
            <h2>Вход</h2>
            {error && <p className={styles.error_message}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                />
                <br/>
                <div style={{ width: "100%", textAlign: "right", marginTop: 8 }}>
                    <Link to="/forgot" style={{ fontSize: "14px" }}>Забыли пароль?</Link>
                </div>
                <div className={styles.passwordWrapper}>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        className={styles.passwordInput}
                    />
                    <button
                        type="button"
                        className={styles.toggle_visibility}
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                        }}
                        disabled={isLoading}
                        tabIndex={-1}
                        title="Переключить видимость пароля"
                    >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
                <br/>
                <button type="submit" disabled={isLoading} className={styles.submit_button}>
                    {isLoading ? (
                        <span className={styles.loading_content}>
                            <LoadingSpinner size="small" text="" />
                            <span>Вход...</span>
                        </span>
                    ) : "Войти"}
                </button>
            </form>

            <hr style={{margin: "20px 0"}}/>
            <p style={{ marginTop: "12px" }}>
                Еще нет аккаунта? <Link to="/register-step1">Зарегистрироваться</Link>
            </p>
        </div>
    );
}

export default LogInPage;
