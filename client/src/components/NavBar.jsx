import { useContext, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Tooltip, Whisper } from 'rsuite';
import { Icon } from '@iconify/react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

// Store
import { useDialog } from 'src/context/DialogContext';
import { useAuth } from 'context/AuthContext';
import { SocketContext } from 'context/Context';

// Lib
import { createClassesFromArray } from 'src/lib/utils';
import { useApp } from 'src/context/AppContext';
import { NEW_EVENT_LOGOUT } from '../../../constants.json';

const linkStyle = `md:h-[60px] w-full flex items-center justify-center hover:bg-primary rounded-[15px] `;
const activeStyle = linkStyle + 'bg-primary shadow-2xl';

const NavBar = ({ className }) => {
	const { authState, dispatchAuth } = useAuth();
	const { logout } = useKindeAuth();
	const socket = useContext(SocketContext);

	const { app } = useApp();
	const location = useLocation();
	const { setDialog } = useDialog();

	function logOut() {
		dispatchAuth({
			type: 'LOGOUT',
		});
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
			className={createClassesFromArray([
				className,
				hideNavbar && 'hidden',
				'navContainer',
				'bg-secondary',
				'md:w-[120px]',
				'md:min-h-screen',
				'items-center',
				'md:flex-col',
				'flex-row',
				'justify-center',
				'shadow-[0_0_100px_0_rgba(0,0,0,1)]',
				'p-2',
				'md:p-5',
				'sticky bottom-0',
				'md:flex',
				'h-[70px]',
			])}
		>
			<div className='hidden md:flex'>
				<img src='favicon.ico'/>
			</div>
			<div className="justify-between md:justify-center flex items-center md:flex-col flex-row h-full w-full gap-2 flex-nowrap overflow-auto md:h-full">
				<Whisper
					placement="auto"
					controlId="control-id-hover"
					trigger="hover"
					speaker={<Tooltip>Search for random buddies</Tooltip>}
				>
					<NavLink to="/" className={getLinkStyle}>
						<Icon icon="fluent:people-search-20-regular" color="white" height="24" width="24" />
						{className}
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
				<div className='flex w-full md:hidden'>
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
			
			<div className='flex w-full md:hidden'>
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
			<div className='hidden md:block w-full'>
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
