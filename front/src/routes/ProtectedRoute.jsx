import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
    const { isAuth, isInitializing } = useAuth();
    
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
    
    return isAuth ? children : <Navigate to="/login" />;
}
