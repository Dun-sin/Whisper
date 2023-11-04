import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exo_2 } from 'next/font/google';

import { KindeProvider } from '@kinde-oss/kinde-auth-react';

// Store
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ChatProvider } from '@/context/ChatContext';

// Components
import NavBar from './NavBar';
import { api } from '@/lib/axios';

import useIsTabActive from '@/hooks/useIsTabActive';
import { ProviderType } from '@/types';

const clientID = process.env.IMPORTANT;
const exo2 = Exo_2({ subsets: ['latin'] });

const PageWrapper = ({ children }: ProviderType) => {
	const { isLoggedIn, dispatchAuth } = useAuth();
	const { loadUserSettings, updateOnlineStatus, app } = useApp();
	const router = useRouter();
	const { settings } = app;

	const [onlineStatus, setOnlineStatus] = useState<Date | string | null>(null);

	const isTabActive = useIsTabActive();

	async function loginWithEmail(email: string) {
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
			return;
		}

		if (isTabActive) {
			setOnlineStatus('online');
		} else {
			setOnlineStatus(new Date());
		}
	}, [isTabActive]);

	useEffect(() => {
		updateOnlineStatus(onlineStatus);
	}, [onlineStatus]);

	useEffect(() => {
		!isLoggedIn && router.push('/login');
	}, []);

	return (
		<KindeProvider
			clientId={clientID}
			domain='https://whisper.kinde.com'
			logoutUri={window.location.origin}
			redirectUri={window.location.origin + '/login'}
			onRedirectCallback={(user: any) => {
				loginWithEmail(user.email);
			}}>
			<div
				className={`flex flex-col-reverse md:flex-row h-screen ${
					settings.theme && 'dark'
				} ${exo2.className}`}>
				{isLoggedIn && <NavBar />}
				<ChatProvider>{children}</ChatProvider>
			</div>
		</KindeProvider>
	);
};

export default PageWrapper;
