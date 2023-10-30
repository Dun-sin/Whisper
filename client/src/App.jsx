import { useEffect, useState } from 'react';
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
import Profile from './pages/Profile';
import Login from 'pages/Login';
import Settings from 'pages/Settings';
import NoPage from './pages/NoPage';

import useIsTabActive from './hooks/useIsTabActive';

const clientID = import.meta.env.VITE_IMPORTANT;

function App() {
	const { isLoggedIn, dispatchAuth } = useAuth();
	const { loadUserSettings, updateOnlineStatus, app } = useApp(); 

	const { settings } = app
	const [onlineStatus, setOnlineStatus] = useState(null)

	const isTabActive = useIsTabActive()

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

	useEffect(() => {
		if (!isLoggedIn) {
			return
		}

		if (isTabActive) {
			setOnlineStatus('online')
		} else {
			setOnlineStatus(new Date)
		}
	}, [isTabActive])

	useEffect(() => {
		updateOnlineStatus(onlineStatus)
	}, [onlineStatus])

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
			<div className={`flex flex-col-reverse md:flex-row h-screen ${settings.theme && 'dark'}`}>
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
					<Route path="*" element={<NoPage />} />
				</Routes>
			</div>
		</KindeProvider>
	);
}

export default App;
