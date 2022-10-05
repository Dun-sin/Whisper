import { useAuth } from 'src/context/AuthContext';

export const Logout = () => {
    const { logout } = useAuth();
    logout();
    return window.location.href = '/';
}

export default Logout;
