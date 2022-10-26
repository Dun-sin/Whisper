import { useContext, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Tooltip, Whisper } from 'rsuite';

// Icons
import { BsChatDots } from 'react-icons/bs';
import { RiUserSearchLine } from 'react-icons/ri';
import { BiUserCircle, BiLogOut, BiCog } from 'react-icons/bi';

// Store
import { useDialog } from 'src/context/DialogContext';
import { useAuth } from 'context/AuthContext';
import { SocketContext } from 'context/Context';

// Lib
import { createClassesFromArray } from 'src/lib/utils';
import { useApp } from 'src/context/AppContext';

const linkStyle = `py-4 md:h-[80px] w-[100%] flex items-center justify-center hover:bg-primary p-6 rounded-[15px] `;
const activeStyle = linkStyle + 'bg-primary shadow-2xl';
const iconStyle = 'fill-[#f5f5f5] scale-[2]';

const NavBar = ({ className }) => {
    const { auth, logout } = useAuth();
    const { app } = useApp();
    const socket = useContext(SocketContext);
    const location = useLocation();
    const { setDialog } = useDialog();

    const handleLogout = () => {
        setDialog({
            isOpen: true,
            text: 'Are you sure you want to logout?',
            noBtnText: 'Cancel',
            yesBtnText: 'Yes, log me out',
            handler: () => {
                logout();
                if (socket.disconnected) {
                    socket.volatile.emit('logout', {
                        email: auth.email,
                        loginId: auth.loginId,
                    });
                } else {
                    socket.emit('logout', {
                        email: auth.email,
                        loginId: auth.loginId,
                    });
                }
            },
        });
    };

    const getLinkStyle = ({ isActive }) => (isActive ? activeStyle : linkStyle);
    const fullscreenPages = ['/founduser'];

    const hideNavbar = useMemo(
        () => fullscreenPages.includes(location.pathname) && !app.isSearching,
        [location, app]
    );

    return (
        <div
            className={createClassesFromArray([
                className,
                hideNavbar && 'hidden md:flex',
                'navContainer',
                'bg-secondary',
                'md:w-[120px]',
                'md:min-h-screen',
                'items-center',
                'md:flex-col',
                'flex-row',
                'justify-center',
                'shadow-[0_0_100px_0_rgba(0,0,0,1)]',
                'px-2',
                'md:p-5',
                'sticky bottom-0',
                'flex',
                'h-[70px]'
            ])}
        >
            <div className="justify-between md:justify-center flex items-center md:flex-col flex-row w-full gap-2 flex-nowrap overflow-auto md:h-full no-scrollbar">
                <Whisper
                    placement="auto"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>Search for random buddies</Tooltip>}
                >
                    <NavLink to="/" className={getLinkStyle}>
                        <RiUserSearchLine className={iconStyle} />
                        {className}
                    </NavLink>
                </Whisper>
                <Whisper
                    placement="auto"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>My Chats</Tooltip>}
                >
                    <NavLink to="/friends" className={getLinkStyle}>
                        <BsChatDots className={iconStyle} />
                    </NavLink>
                </Whisper>
                <Whisper
                    placement="auto"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>My Profile</Tooltip>}
                >
                    <NavLink to="/profile" className={getLinkStyle}>
                        <BiUserCircle className={iconStyle} />
                    </NavLink>
                </Whisper>
                <Whisper
                    placement="auto"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>System Settings</Tooltip>}
                >
                    <NavLink to="/settings" className={getLinkStyle}>
                        <BiCog className={iconStyle} />
                    </NavLink>
                </Whisper>
                <Whisper
                    placement="auto"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>Logout</Tooltip>}
                >
                    <button
                        className={linkStyle}
                        onClick={() => handleLogout()}
                    >
                        <BiLogOut className={iconStyle} />
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
