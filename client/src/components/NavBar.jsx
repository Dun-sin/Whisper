import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

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

const linkStyle = `h-full w-full flex items-center justify-center hover:bg-primary rounded-[15px] md:max-h-[60px] md:h-[60px] md:min-h-[60px] `;
const activeStyle = linkStyle + 'bg-primary';

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
			className={`${
				hideNavbar && 'hidden'
			} bg-secondary md:w-[120px] md:min-h-screen md:max-h-screen items-center md:flex-col flex-row justify-between shadow-[rgb(0,_0,_0)_12px_0px_18px_-18px] p-2 md:p-5 sticky bottom-0 md:flex max-h-[70px] h-[70px] min-h-[70px]`}
		>
			<div className="hidden md:flex">
				<img src="favicon.ico" />
			</div>
			<div className="justify-between md:justify-center flex items-center md:flex-col flex-row w-full gap-2 flex-nowrap overflow-auto">
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Search for random buddies</Tooltip>}
				>
					<NavLink to="/" className={getLinkStyle}>
						<Icon icon="fluent:people-search-20-regular" color="white" height="24" width="24" />
					</NavLink>
				</Whisper>
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Friends</Tooltip>}
				>
					<NavLink to="/friends" className={getLinkStyle}>
						<Icon color="white" icon="la:user-friends" height="24" width="24" />
					</NavLink>
				</Whisper>
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>My Profile</Tooltip>}
				>
					<NavLink to="/profile" className={getLinkStyle}>
						<Icon icon="fluent:person-circle-20-regular" color="white" height="24" width="24" />
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
							<Icon icon="ic:outline-settings" color="white" height="24" width="24" />
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
							<Icon icon="majesticons:logout-half-circle" color="white" height={24} width={24} />
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
						<Icon icon="ic:outline-settings" color="white" height="24" width="24" />
					</NavLink>
				</Whisper>
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Logout</Tooltip>}
				>
					<button className={linkStyle} onClick={() => handleLogout()}>
						<Icon icon="majesticons:logout-half-circle" color="white" height={24} width={24} />
					</button>
				</Whisper>
			</div>
		</div>
	);
};

NavBar.propTypes = {
	className: PropTypes.string,
};

export default NavBar;
