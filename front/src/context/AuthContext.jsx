import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState(false);
    const [tokens, setTokens] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Функция для обновления токенов
    const refreshTokens = useCallback(async () => {
        if (!tokens?.refresh || isRefreshing) return false;
        
        setIsRefreshing(true);
        try {
            const response = await axios.post(`${API_URL}token/refresh/`, {
                refresh: tokens.refresh,
            });
            
            const newTokens = {
                access: response.data.access,
                refresh: response.data.refresh || tokens.refresh, // Если сервер не возвращает новый refresh токен
            };
            
            localStorage.setItem("tokens", JSON.stringify(newTokens));
            setTokens(newTokens);
            setIsRefreshing(false);
            return true;
        } catch (error) {
            console.warn("❌ Refresh token expired — logout()");
            logout();
            setIsRefreshing(false);
            return false;
        }
    }, [tokens, isRefreshing]);

    // При запуске — читаем токены из localStorage
    useEffect(() => {
        const storedTokens = localStorage.getItem("tokens");
        if (storedTokens) {
            try {
                const parsedTokens = JSON.parse(storedTokens);
                setTokens(parsedTokens);
                setIsAuth(true);
            } catch (error) {
                console.error("Error parsing stored tokens:", error);
                localStorage.removeItem("tokens");
            }
        }
        setIsInitializing(false);
    }, []);

    // Автоматическое обновление токенов каждые 14 минут (за 1 минуту до истечения)
    useEffect(() => {
        if (!tokens?.access) return;

        const interval = setInterval(async () => {
            await refreshTokens();
        }, 14 * 60 * 1000); // 14 минут

        return () => clearInterval(interval);
    }, [tokens, refreshTokens]);

    const login_context = (access, refresh) => {
        const newTokens = { access, refresh };
        localStorage.setItem("tokens", JSON.stringify(newTokens));
        setTokens(newTokens);
        setIsAuth(true);
    };

    const logout = useCallback(() => {
        localStorage.removeItem("tokens");
        setTokens(null);
        setIsAuth(false);
        setIsRefreshing(false);
    }, []);

    // Настройка axios interceptor для автоматического добавления токенов и обработки ошибок
    useEffect(() => {
        // Request interceptor для добавления токена
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (tokens?.access) {
                    config.headers.Authorization = `Bearer ${tokens.access}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor для обработки ошибок аутентификации
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    // Пытаемся обновить токены
                    const refreshed = await refreshTokens();
                    
                    if (refreshed) {
                        // Повторяем запрос с новым токеном
                        originalRequest.headers.Authorization = `Bearer ${tokens?.access}`;
                        return axios(originalRequest);
                    } else {
                        // Если не удалось обновить токены, делаем logout
                        logout();
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [tokens, refreshTokens, logout]);

    return (
        <AuthContext.Provider value={{ 
            isAuth, 
            tokens, 
            login_context, 
            logout, 
            refreshTokens,
            isRefreshing,
            isInitializing 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
