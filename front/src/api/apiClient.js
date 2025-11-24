import axios from "axios";
import { API_URL } from "../config.js";

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Функция для установки токена авторизации
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Функция для получения токена из localStorage
export const getStoredToken = () => {
    try {
        const tokens = localStorage.getItem("tokens");
        return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
        console.error("Error parsing stored tokens:", error);
        return null;
    }
};

// Функция для сохранения токенов
export const storeTokens = (tokens) => {
    localStorage.setItem("tokens", JSON.stringify(tokens));
};

// Функция для удаления токенов
export const removeTokens = () => {
    localStorage.removeItem("tokens");
};

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Обработка ошибок авторизации
        if (error.response?.status === 401) {
            removeTokens();
            setAuthToken(null);
            // Перенаправление на страницу входа, если не на странице входа
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // Улучшенная обработка ошибок
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message ||
                            error.message ||
                            'Произошла ошибка при выполнении запроса';
        
        // Создаем улучшенный объект ошибки
        const enhancedError = {
            ...error,
            message: errorMessage,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        };
        
        return Promise.reject(enhancedError);
    }
);

// Инициализация токена при загрузке модуля
const storedTokens = getStoredToken();
if (storedTokens?.access) {
    setAuthToken(storedTokens.access);
}

export default apiClient;
