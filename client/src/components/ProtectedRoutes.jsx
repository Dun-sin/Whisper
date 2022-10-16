import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function ProtectedRoutes({ isLoggedIn }) {
    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
}

ProtectedRoutes.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
};
