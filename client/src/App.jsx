// Components
import Login from 'pages/Login';
import { useAuth } from 'context/AuthContext';
import NavBar from 'components/NavBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Start from 'pages/Start';
import Searching from 'pages/Searching';
import ComingSoon from 'pages/ComingSoon';
import ProtectedRoutes from 'components/ProtectedRoutes';

function App() {
    const { isLoggedIn } = useAuth();

    return (
        <div className="flex mdl:flex-col-reverse flex-row min-h-screen">
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
