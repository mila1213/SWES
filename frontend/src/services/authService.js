import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://swes-proyecto-web.onrender.com/api";

export const registerUser = async (userData) => {
  const response = await axios.post(`${BACKEND}/register`, userData);
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${BACKEND}/login`, { email, password });
  return response.data;
};

export const googleSignIn = async (idToken) => {
  const response = await axios.post(`${BACKEND}/google`, { idToken });
  return response.data;
};

// =======================================================
// FUNCIONES TEMPORALES PARA EVITAR ERRORES DE COMPILACIÓN
// =======================================================
export const verifyAccount = async () => { return { message: "Mock" }; };
export const resetPassword = async () => { return { message: "Mock" }; };