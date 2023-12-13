import { useContext, useMemo, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Tooltip, Whisper } from 'rsuite';
import { Icon } from '@iconify/react';

// Store
import { useDialog } from '@/context/DialogContext';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useApp } from '@/context/AppContext';

// Lib
import constants from '@/constants';
import { IsActiveType } from '@/types/types';
import Image from 'next/image';

const linkStyle = `h-full w-full flex items-center justify-center hover:bg-primary rounded-[15px] md:max-h-[60px] md:h-[60px] md:min-h-[60px] `;
const activeStyle = linkStyle + 'bg-primary';

const NavBar = () => {
  const { authState, dispatchAuth } = useAuth();
  const { socket } = useSocket();

  const [isActive, setIsActive] = useState<IsActiveType>('search');

  const { app } = useApp();
  const location = usePathname();
  const { setDialog } = useDialog();

  function logOut() {
    dispatchAuth({
      type: 'LOGOUT',
    });
  }

  const handleLogout = () => {
    setDialog({
      isOpen: true,
      text: 'Are you sure you want to logout?',
      noBtnText: 'Cancel',
      yesBtnText: 'Yes, log me out',
      handler: () => {
        if (socket?.disconnected) {
          socket.volatile.emit(constants.NEW_EVENT_LOGOUT, {
            email: authState.email,
            loginId: authState.loginId,
          });
        } else {
          socket?.emit(constants.NEW_EVENT_LOGOUT, {
            email: authState.email,
            loginId: authState.loginId,
          });
        }
        logOut();
      },
    });
  };

  const setLinkStyle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const link = e.currentTarget.getAttribute('data-link') as IsActiveType;
    if (link) {
      setIsActive(link);
    }
  };

  const fullscreenPages = ['/founduser'];

  const hideNavbar = useMemo(
    () => fullscreenPages.includes(location) && app.currentChatId,
    [location, app]
  );

  return (
    <div
      className={`${
        hideNavbar && 'hidden'
      } bg-secondary md:w-[120px] md:min-h-screen md:max-h-screen items-center md:flex-col flex-row justify-between shadow-[rgb(0,_0,_0)_12px_0px_18px_-18px] p-2 md:p-5 sticky bottom-0 md:flex max-h-[70px] h-[70px] min-h-[70px]`}
    >
      <div className='hidden md:flex'>
        <Image src='/favicon.ico' alt='Whisper logo' width={50} height={50} />
      </div>
      <div className='justify-between md:justify-center flex items-center md:flex-col flex-row w-full gap-2 flex-nowrap overflow-auto'>
        <Whisper
          placement='auto'
          controlId='control-id-hover'
          trigger='hover'
          speaker={<Tooltip>Search for random buddies</Tooltip>}
        >
          <Link
            href='/'
            className={isActive === 'search' ? activeStyle : linkStyle}
            onClick={setLinkStyle}
            data-link='search'
          >
            <Icon
              icon='fluent:people-search-20-regular'
              color='white'
              height='24'
              width='24'
            />
          </Link>
        </Whisper>
        <Whisper
          placement='auto'
          controlId='control-id-hover'
          trigger='hover'
          speaker={<Tooltip>Friends</Tooltip>}
        >
          <Link
            href='/friends'
            className={isActive === 'friends' ? activeStyle : linkStyle}
            onClick={setLinkStyle}
            data-link='friends'
          >
            <Icon color='white' icon='la:user-friends' height='24' width='24' />
          </Link>
        </Whisper>
        <Whisper
          placement='auto'
          controlId='control-id-hover'
          trigger='hover'
          speaker={<Tooltip>My Profile</Tooltip>}
        >
          <Link
            href='/profile'
            className={isActive === 'profile' ? activeStyle : linkStyle}
            onClick={setLinkStyle}
            data-link='profile'
          >
            <Icon
              icon='fluent:person-circle-20-regular'
              color='white'
              height='24'
              width='24'
            />
          </Link>
        </Whisper>

        {/* show only on mobile screen */}
        <div className='flex w-full md:hidden h-full'>
          <Whisper
            placement='auto'
            controlId='control-id-hover'
            trigger='hover'
            speaker={<Tooltip>Settings</Tooltip>}
          >
            <Link
              href='/settings'
              className={isActive === 'settings' ? activeStyle : linkStyle}
              onClick={setLinkStyle}
              data-link='settings'
            >
              <Icon
                icon='ic:outline-settings'
                color='white'
                height='24'
                width='24'
              />
            </Link>
          </Whisper>
        </div>

        <div className='flex w-full md:hidden h-full'>
          <Whisper
            placement='auto'
            controlId='control-id-hover'
            trigger='hover'
            speaker={<Tooltip>Logout</Tooltip>}
          >
            <button className={linkStyle} onClick={() => handleLogout()}>
              <Icon
                icon='majesticons:logout-half-circle'
                color='white'
                height={24}
                width={24}
              />
            </button>
          </Whisper>
        </div>
      </div>
      <div className='hidden md:flex w-full flex-col gap-2'>
        <Whisper
          placement='auto'
          controlId='control-id-hover'
          trigger='hover'
          speaker={<Tooltip>Settings</Tooltip>}
        >
          <Link
            href='/settings'
            className={isActive === 'settings' ? activeStyle : linkStyle}
            onClick={setLinkStyle}
            data-link='settings'
          >
            <Icon
              icon='ic:outline-settings'
              color='white'
              height='24'
              width='24'
            />
          </Link>
        </Whisper>
        <Whisper
          placement='auto'
          controlId='control-id-hover'
          trigger='hover'
          speaker={<Tooltip>Logout</Tooltip>}
        >
          <button className={linkStyle} onClick={() => handleLogout()}>
            <Icon
              icon='majesticons:logout-half-circle'
              color='white'
              height={24}
              width={24}
            />
          </button>
        </Whisper>
      </div>
    </div>
  );
};

export default NavBar;
