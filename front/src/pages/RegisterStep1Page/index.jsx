import {useState} from "react";
import {useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";
import {registerStep1} from "../../api/register.js";
import styles from './style.module.css'
import { Eye, EyeOff } from "lucide-react";

function RegisterStep1Page() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Отправка:", {username, email, password1, password2});
        try {
            const res = await registerStep1(username, email, password1, password2);
            console.log("Ответ:", res);
            setMessage(res.message);
            setError("");
            navigate("/register-step2", {state: {email}});
        } catch (err) {
            console.error("Ошибка:", err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || "Ошибка регистрации");
        }
    };


    return (
        <div className={styles.register_step1}>
            <h2>Регистрация — Шаг 1</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br/>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br/>
                <div className={styles.passwordWrapper}>
                    <input
                        type={showPassword1 ? "text" : "password"}
                        name="password"
                        placeholder="Пароль"
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        className={styles.passwordInput}
                    />
                    <button
                        type="button"
                        className={styles.toggle_visibility}
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPassword1(!showPassword1);
                        }}
                        tabIndex={-1}
                        title="Переключить видимость пароля"
                    >
                        {showPassword1 ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
                <br/>
                <div className={styles.passwordWrapper}>
                    <input
                        type={showPassword2 ? "text" : "password"}
                        name="password2"
                        placeholder="Повторите пароль"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        className={styles.passwordInput}
                    />
                    <button
                        type="button"
                        className={styles.toggle_visibility}
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPassword2(!showPassword2);
                        }}
                        tabIndex={-1}
                        title="Переключить видимость пароля"
                    >
                        {showPassword2 ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
                <br/>
                <button type="submit">Продолжить</button>
            </form>
            {error && <p style={{color: "red"}}>{error}</p>}
            {message && <p style={{color: "green"}}>{message}</p>}
            <p style={{ marginTop: "12px" }}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
        </div>
    );
}

export default RegisterStep1Page;
