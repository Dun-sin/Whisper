/* eslint-disable no-unused-vars */
/* eslint-disable capitalized-comments */
import { useEffect, useState, useRef } from 'react';

import { Icon } from '@iconify/react';
import { Dropdown, IconButton, Tooltip, Whisper } from 'rsuite';

// import Chat from '../components/Chat';
import { useDialog } from 'src/context/DialogContext';

const Friends = () => {
    const [currentChatIdForFriend, setCurrentChatIdForFriend] = useState(null);
    const [currentViewState, setCurrentViewState] = useState(false);

    const { setDialog } = useDialog();

    const friendsListRef = useRef(null);
    const chatSectionRef = useRef(null);

    useEffect(() => {
        const showFriendsList = () => {
            chatSectionRef.current.style.display = 'none';
            friendsListRef.current.style.display = 'flex';
        };
        const showChatSection = () => {
            chatSectionRef.current.style.display = 'block';
            friendsListRef.current.style.display = 'none';
        };

        currentViewState ? showChatSection() : showFriendsList();
    }, [currentViewState]);

    const handleCurrentViewOnMobile = () => {
        setCurrentViewState(!currentViewState);
    };

    const MenuToggle = (props, ref) => {
        return (
            <IconButton
                {...props}
                ref={ref}
                icon={
                    <Icon
                        icon="carbon:overflow-menu-vertical"
                        color="white"
                        height={24}
                        width={24}
                    />
                }
                appearance="subtle"
            />
        );
    };

    const handleClose = () => {
        setDialog({
            isOpen: true,
            text: 'Are you sure you want to remove this friend?',
            handler: () => console.log('function for removing friends'),
        });
    };

    return (
        <div className="w-full bg-primary md:min-h-screen min-h-[calc(100vh-70px)] flex flex-row text-white">
            {/* Container for holding friends list */}
            <section
                className="flex flex-col p-2 w-[25%] SmallerScreens:w-full h-full md:border-r md:border-slate-400 SmallerScreens:hidden"
                ref={friendsListRef}
            >
                {/* A single Friend */}
                <div
                    className="bg-[#FF3A46] h-10 w-full rounded-sm flex items-center justify-between p-2 hover:cursor-pointer"
                    onClick={handleCurrentViewOnMobile}
                >
                    <div className="flex items-center">
                        <Icon
                            icon="fluent:person-circle-20-regular"
                            width="30"
                            height="30"
                        />
                        <div className="ml-2">
                            <p className="text-[.8rem]">Name</p>
                            <p className="text-[.65rem] m-[0px]">
                                Last Message
                            </p>
                        </div>
                    </div>
                    <span className="text-[.6rem]">2:50pm</span>
                </div>
            </section>

            <hr />

            {/* Chat Section */}
            <section
                className="w-[75%] SmallerScreens:w-full h-full p-4 pt-2"
                ref={chatSectionRef}
            >
                <header className="flex justify-between items-center">
                    {/* On mobile view, this is the back button */}
                    <div className="md:hidden">
                        <Whisper
                            placement="auto"
                            controlId="control-id-hover"
                            trigger="hover"
                            speaker={<Tooltip>Friends</Tooltip>}
                        >
                            <IconButton
                                onClick={() =>
                                    handleCurrentViewOnMobile()
                                }
                                appearance="subtle"
                                className="bg-primary "
                                icon={
                                    <Icon
                                        icon="ic:round-arrow-back"
                                        color="white"
                                    />
                                }
                            />
                        </Whisper>
                    </div>
                    <p className="text-md font-bold">Name</p>
                    {/* Dropdown for other options */}
                    <Dropdown
                        placement="leftStart"
                        style={{ zIndex: 3 }}
                        renderToggle={MenuToggle}
                        noCaret
                    >
                        <Dropdown.Item onClick={() => handleClose()}>
                            Remove Friend
                        </Dropdown.Item>
                    </Dropdown>
                </header>
                <hr />
                <div>
                    {/* <Chat
                    isAnonymous={false}
                    currentChatIdForFriend={currentChatIdForFriend}
                /> */}
                </div>
            </section>
        </div>
    );
};

export default Friends;

// TODO: add function for removing friends
// TODO: set way to add friends
// TODO: if there's no current chat open, <Chat /> display should be none