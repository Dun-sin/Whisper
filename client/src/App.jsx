import { Navigate, Route, Routes } from 'react-router-dom';

import { KindeProvider } from '@kinde-oss/kinde-auth-react';

// Store
import { useAuth } from 'context/AuthContext';
import { useApp } from 'src/context/AppContext';

// Components
import NavBar from 'components/NavBar';
import ProtectedRoutes from 'components/ProtectedRoutes';
import { api } from 'src/lib/axios';

// Pages
import Start from 'pages/Start';
import Searching from 'pages/Searching';
import ComingSoon from 'pages/ComingSoon';
import Login from 'pages/Login';
import Settings from 'pages/Settings';

const clientID = import.meta.env.VITE_IMPORTANT;
import Profile from './pages/Profile';

import { useDarkMode } from './context/DarkModeContext';

function App() {
	const { isLoggedIn, dispatchAuth } = useAuth();
	const { loadUserSettings } = useApp();

	const { darkMode } = useDarkMode();

	async function loginWithEmail(email) {
		try {
			const response = await api.post('/login', {
				email,
			});

			if (response.status === 200) {
				const data = await response.data;
				const userID = data.id;

				dispatchAuth({
					type: 'LOGIN',
					payload: {
						loginType: 'email',
						loginId: userID,
						email,
					},
				});
				try {
					const userData = await api.get(`/profile/${email}`);
					loadUserSettings(userData.data?.settings);
				} catch (error) {
					console.error('Error loading user data:', error);
				}
			} else {
				throw new Error('Login failed');
			}
		} catch (err) {
			console.error('Error logging in:', err);
		}
	}

	return (
		<KindeProvider
			clientId={clientID}
			domain="https://whisper.kinde.com"
			logoutUri={window.location.origin}
			redirectUri={window.location.origin + '/login'}
			onRedirectCallback={(user) => {
				loginWithEmail(user.email);
			}}
		>
			<div className={`flex flex-col-reverse md:flex-row h-screen ${darkMode && 'dark'}`}>
				{isLoggedIn && <NavBar />}
				<Routes>
					<Route exact path="/" element={<ProtectedRoutes isLoggedIn={isLoggedIn} />}>
						<Route exact path="/" element={<Start />} />
						{/* TODO: Sepreate searching and foundUser into different routes */}
						<Route exact path="/founduser" element={<Searching />} />
						<Route exact path="/friends" element={<ComingSoon />} />
						<Route exact path="/profile" element={<Profile />} />
						<Route exact path="/settings" element={<Settings />} />
					</Route>

					<Route exact path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
				</Routes>
			</div>
		</KindeProvider>
	);
}

export default App;
