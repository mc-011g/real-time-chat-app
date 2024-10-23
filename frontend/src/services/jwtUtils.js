import { jwtDecode } from 'jwt-decode';

export const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken.role;
    } else {
        return null;
    }
}

export const getUserEmail = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken.sub;
    } else {
        return null;
    }
}

export const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    } else {
        return token;
    }
}

export const checkIfTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token);
        if (Date.now() >= decodedToken.exp * 1000) {
            return true;
        } else {
            return false;
        }
    } else {
        return null;
    }
}