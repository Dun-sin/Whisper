import { Navigate, Route, Routes } from 'react-router-dom';

// Store
import { useAuth } from 'context/AuthContext';

// Components
import ProtectedRoutes from 'components/ProtectedRoutes';
import NavBar from 'components/NavBar';

// Pages
import Start from 'pages/Start';
import Searching from 'pages/Searching';
import ComingSoon from 'pages/ComingSoon';
import Login from 'pages/Login';
import Settings from 'pages/Settings';

function App() {
    const { isLoggedIn } = useAuth();

    return (
        <div className="flex flex-col-reverse md:flex-row min-h-screen">
            {/* TODO: Create layouts */}
            {isLoggedIn && <NavBar />}
            <Routes>
                <Route
                    exact
                    path="/"
                    element={<ProtectedRoutes isLoggedIn={isLoggedIn} />}
                >
                    <Route exact path="/" element={<Start />} />
                    <Route exact path="/founduser" element={<Searching />} />
                    <Route exact path="/friends" element={<ComingSoon />} />
                    <Route exact path="/profile" element={<ComingSoon />} />
                    <Route exact path="/settings" element={<Settings />} />
                </Route>

                <Route
                    exact
                    path="/login"
                    element={isLoggedIn ? <Navigate to="/" /> : <Login />}
                />
            </Routes>
        </div>
    );
}

export default App;
