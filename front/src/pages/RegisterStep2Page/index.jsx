import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";
import {registerStep2} from "../../api/register.js";
import styles from './style.module.css'

function RegisterStep2Page() {
    const location = useLocation();
    const emailFromStep1 = location.state?.email || "";
    const [email, setEmail] = useState(emailFromStep1);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await registerStep2(email, code);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка подтверждения");
        }
    };

    return (
        <div className={styles.register_step2}>
            <h2>Регистрация — Шаг 2</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br/>
                <input
                    type="text"
                    placeholder="Код из письма"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <br/>
                <button type="submit">Подтвердить</button>
            </form>
            {error && <p style={{color: "red"}}>{error}</p>}
            <p style={{ marginTop: "12px" }}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
        </div>
    );
}

export default RegisterStep2Page;
