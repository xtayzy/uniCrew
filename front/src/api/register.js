import axios from "axios";
import { API_URL } from "../config.js";


export async function registerStep1(username, email, password1, password2){
    const response = await axios.post(`${API_URL}register-step1/`, {
        username,
        email,
        password1,
        password2
    })

    console.log(response.data)
    return response.data
}

export async function registerStep2(email, code){
    const response = await axios.post(`${API_URL}register-step2/`, {
        email,
        code
    })

    return response.data
}