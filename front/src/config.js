// Конфигурация API URL
// В production использует переменную окружения, в development - localhost
const getApiUrl = () => {
  // Проверяем переменную окружения Vite
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Для development
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000/api/';
  }
  
  // Fallback для production (если переменная не установлена)
  // Замените на ваш домен
  return window.location.origin + '/api/';
};

export const API_URL = getApiUrl();

