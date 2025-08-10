import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { Tooltip, Whisper } from 'rsuite';
import { Icon } from '@iconify/react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

// Store
import { useDialog } from 'src/context/DialogContext';
import { useAuth } from 'context/AuthContext';
import { socket } from 'src/lib/socketConnection';

// Lib
import { useApp } from 'src/context/AppContext';
import { NEW_EVENT_LOGOUT } from '../../../constants.json';

const linkStyle = `h-full w-full flex items-center justify-center transition-all duration-200 rounded-full md:max-h-[60px] md:h-[60px] md:min-h-[60px] hover:scale-110 hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500`;
const activeStyle = `${linkStyle} bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg scale-110`;

const NavBar = () => {
	const { authState, dispatchAuth } = useAuth();
	const { logout } = useKindeAuth();

	const { app } = useApp();
	const location = useLocation();
	const { setDialog } = useDialog();

	function logOut() {
		dispatchAuth({
			type: 'LOGOUT',
		});
		setDialog({ isOpen: false });
		logout();
	}

	const handleLogout = () => {
		setDialog({
			isOpen: true,
			text: 'Are you sure you want to logout?',
			noBtnText: 'Cancel',
			yesBtnText: 'Yes, log me out',
			handler: () => {
				if (socket.disconnected) {
					socket.volatile.emit(NEW_EVENT_LOGOUT, {
						email: authState.email,
						loginId: authState.loginId,
					});
				} else {
					socket.emit(NEW_EVENT_LOGOUT, {
						email: authState.email,
						loginId: authState.loginId,
					});
				}
				logOut();
			},
		});
	};

	const getLinkStyle = ({ isActive }) => (isActive ? activeStyle : linkStyle);
	const fullscreenPages = ['/founduser'];

	const hideNavbar = useMemo(
		() => fullscreenPages.includes(location.pathname) && app.currentChatId,
		[location, app]
	);

	return (
		<div
			className={`${hideNavbar ? 'hidden' : ''} bg-gradient-to-br from-blue-100 via-purple-200 to-pink-200 md:w-[80px] md:min-h-screen md:max-h-screen items-center md:flex-col flex-row justify-between shadow-lg p-1 md:p-2 sticky bottom-0 md:flex max-h-[56px] h-[56px] min-h-[56px]`}
		>
			{/* User Avatar Section */}
			<div className="flex flex-col items-center justify-center mb-2 md:mb-4">
				<img src={authState?.avatarUrl || '/public/logo192.png'} alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-purple-400 shadow-md" />
				<span className="mt-1 text-xs font-semibold text-purple-700">{authState?.username || 'User'}</span>
			</div>
			<div className="justify-between md:justify-center flex items-center md:flex-col flex-row w-full h-full gap-2 flex-nowrap overflow-auto">
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Search for random buddies</Tooltip>}
				>
					<NavLink to="/" className={getLinkStyle}>
						<Icon icon="material-symbols:search-rounded" color="#7c3aed" height="22" width="22" />
					</NavLink>
				</Whisper>
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Friends</Tooltip>}
				>
					<NavLink to="/friends" className={getLinkStyle}>
						<Icon icon="mdi:account-group" color="#7c3aed" height="22" width="22" />
					</NavLink>
				</Whisper>
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>My Profile</Tooltip>}
				>
					<NavLink to="/profile" className={getLinkStyle}>
						<Icon icon="mdi:account-circle" color="#7c3aed" height="22" width="22" />
					</NavLink>
				</Whisper>

				{/* show only on mobile screen */}
				<div className="flex w-full md:hidden h-full">
					<Whisper
						placement="auto"
						controlId="control-id-hover"
						trigger="hover"
						speaker={<Tooltip>Settings</Tooltip>}
					>
						<NavLink to="/settings" className={getLinkStyle}>
							<Icon icon="mdi:cog-outline" color="#7c3aed" height="22" width="22" />
						</NavLink>
					</Whisper>
				</div>

				<div className="flex w-full md:hidden h-full">
					<Whisper
						placement="auto"
						controlId="control-id-hover"
						trigger="hover"
						speaker={<Tooltip>Logout</Tooltip>}
					>
						<button className={linkStyle} onClick={() => handleLogout()}>
							<Icon icon="mdi:logout" color="#7c3aed" height={22} width={22} />
						</button>
					</Whisper>
				</div>
			</div>
			<div className="hidden md:flex w-full flex-col gap-2">
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Settings</Tooltip>}
				>
					<NavLink to="/settings" className={getLinkStyle}>
						<Icon icon="mdi:cog-outline" color="#7c3aed" height="22" width="22" />
					</NavLink>
				</Whisper>
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Logout</Tooltip>}
				>
					<button className={linkStyle} onClick={() => handleLogout()}>
						<Icon icon="mdi:logout" color="#7c3aed" height={22} width={22} />
					</button>
				</Whisper>
			</div>
		</div>
	);
}

export default NavBar;
