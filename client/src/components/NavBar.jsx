import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip, Whisper } from 'rsuite';

// Icons
import { BsChatDots } from 'react-icons/bs';
import { RiUserSearchLine } from 'react-icons/ri';
import { BiUserCircle, BiLogOut } from 'react-icons/bi';

// Store
import { useAuth } from 'context/AuthContext';
import { SocketContext } from 'context/Context';

const linkStyle = `h-[80px] w-[100%] flex items-center justify-center hover:bg-primary p-6 rounded-[15px] `;
const activeStyle = linkStyle + 'bg-primary shadow-2xl';
const iconStyle = 'fill-[#f5f5f5] scale-[2]';

const NavBar = () => {
    const { logout } = useAuth();
    const socket = useContext(SocketContext);

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();

            socket.emit('logout');
        }
    };

    const getLinkStyle = ({ isActive }) => (isActive ? activeStyle : linkStyle);

    return (
        <div className="navContainer bg-secondary md:w-[120px] md:min-h-[100vh] mdl: flex items-center flex-col mdl:flex-row justify-center shadow-[0_0_100px_0_rgba(0,0,0,1)] p-5">
            <div className="justify-between flex items-center flex-col mdl:flex-row h-[35%] w-[100%] gap-3">
                <Whisper
                    placement="auto"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>Search for random buddies</Tooltip>}
                >
                    <NavLink to="/" className={getLinkStyle}>
                        <RiUserSearchLine className={iconStyle} />
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

export default NavBar;
