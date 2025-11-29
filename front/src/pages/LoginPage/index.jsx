import { useState } from "react";
import {useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";
import styles from './style.module.css'
import {login} from "../../api/auth.js";
import LoadingSpinner from "../../components/LoadingSpinner/index.jsx";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

function LogInPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login_context } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { access, refresh } = await login(username, password);
            login_context(access, refresh);
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
                <button type="submit" disabled={isLoading} style={{ position: 'relative', minHeight: '40px' }}>
                    {isLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <LoadingSpinner size="small" text="" />
                            <span>Вход...</span>
                        </span>
                    ) : "Войти"}
                </button>
            </form>

            {error && <p style={{color: "red"}}>{error}</p>}

            <hr style={{margin: "20px 0"}}/>
            <p style={{ marginTop: "12px" }}>
                Еще нет аккаунта? <Link to="/register-step1">Зарегистрироваться</Link>
            </p>
        </div>
    );
}

export default LogInPage;
