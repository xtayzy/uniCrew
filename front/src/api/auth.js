import axios from "axios";
import { API_URL } from "../config.js";

export async function login(username, password) {
    try {
        const response = await axios.post(`${API_URL}login/`, { 
            username, 
            password 
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || `Ошибка входа`);
    }
}

export async function refreshToken(refreshToken) {
    try {
        const response = await axios.post(`${API_URL}token/refresh/`, {
            refresh: refreshToken
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Ошибка обновления токена");
    }
}

export async function logout() {
    // В случае с JWT токенами, logout обычно происходит только на клиенте
    // Сервер не хранит состояние сессии
    localStorage.removeItem("tokens");
}

export async function forgotCredentials(email) {
    try {
        const response = await axios.post(`${API_URL}password-reset/`, { email });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || error.response?.data?.detail || `Ошибка отправки письма`);
    }
}

export async function changePassword(oldPassword, newPassword1, newPassword2, accessToken) {
    try {
        const response = await axios.post(
            `${API_URL}change-password/`,
            {
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || error.response?.data?.detail || "Ошибка смены пароля";
        throw new Error(msg);
    }
}


