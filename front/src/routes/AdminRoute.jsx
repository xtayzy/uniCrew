import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }) {
    const { isAuth, user, isInitializing } = useAuth();
    
    // Показываем загрузку пока идет инициализация
    if (isInitializing) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px'
            }}>
                Загрузка...
            </div>
        );
    }
    
    // Проверяем авторизацию и права администратора
    if (!isAuth) {
        return <Navigate to="/login" />;
    }
    
    if (!user?.is_staff) {
        return <Navigate to="/" />;
    }
    
    return children;
}

