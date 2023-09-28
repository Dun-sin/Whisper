import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// Rsuite
import { Dropdown, IconButton, Tooltip, Whisper } from 'rsuite';
import { Icon } from '@rsuite/icons';

// Icons
import { BiArrowBack, BiDotsVerticalRounded } from 'react-icons/bi';

// Store
import { SocketContext } from 'src/context/Context';
import { useChat } from 'src/context/ChatContext';
import { useApp } from 'src/context/AppContext';
import { useDialog } from 'src/context/DialogContext';

// Components
import Chat from 'components/Chat';
import { createClassesFromArray, isExplicitDisconnection } from 'src/lib/utils';

import useKeyPress from 'src/hooks/useKeyPress';

const centerItems = `flex items-center justify-center`;

const Anonymous = ({ onChatClosed }) => {
    const { app, endSearch } = useApp();
    const { currentChatId } = app;
    const currentChatIdRef = useRef(currentChatId);
    const [isTyping, setIsTyping] = useState(false);
    const [autoSearchAfterClose, setAutoSearchAfterClose] = useState(false);
    const [disconnected, setDisconnected] = useState(false);
    const autoSearchRef = useRef();
    autoSearchRef.current = autoSearchAfterClose;
    /**
     * @type {React.MutableRefObject<null | ReturnType<setTimeout>>}
     */
    const typingStatusTimeoutRef = useRef(null);

    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const { closeChat } = useChat();
    const { setDialog } = useDialog();

    socket.on('display', ({ isTyping, chatId }) => {
        // eslint-disable-next-line curly
        if (chatId !== currentChatId) return;
        if (!isTyping) {
            setIsTyping(false);
            return;
        }

        setIsTyping(true);

        if (typingStatusTimeoutRef.current) {
            clearTimeout(typingStatusTimeoutRef.current);
        }

        typingStatusTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 3000);
    });

    const closeChatHandler = (autoSearch = false) => {
        const currentChatId = currentChatIdRef.current;

        if (!currentChatId) {
            navigate('/');
            return;
        }

        setAutoSearchAfterClose(autoSearch);

        socket
            .timeout(30000)
            .emit('close', currentChatId, (err, chatClosed) => {
                if (err) {
                    alert('An error occured whiles closing chat.');
                    setAutoSearchAfterClose(false);
                    return err;
                }

                if (chatClosed) {
                    closeChat(currentChatId);
                }

                endSearch();

                if (chatClosed && autoSearchRef.current) {
                    if (onChatClosed) {
                        onChatClosed();
                    }

                    setAutoSearchAfterClose(false);
                } else {
                    navigate('/');
                }
            });
    };

    const MenuToggle = (props, ref) => {
        return (
            <IconButton
                {...props}
                ref={ref}
                icon={<Icon as={BiDotsVerticalRounded} />}
                appearance="subtle"
                circle
            />
        );
    };

    const handleClose = (autoSearch = false) => {
        setDialog({
            isOpen: true,
            text: 'Are you sure you want to close this chat?',
            handler: () => closeChatHandler(autoSearch),
        });
    };

    useKeyPress(['c'], () => handleClose());
    useKeyPress(['n'], () => handleClose(true));

    useEffect(() => {
        const newMessageEvents = [
            'receive_message',
            'delete_message',
            'edit_message',
        ];

        const connectionEvents = {
            connect: () => {
                setDisconnected(false);
            },

            disconnect: (reason) => {
                setDisconnected(!isExplicitDisconnection(reason));
            },
        };

        function onNewMessage() {
            setIsTyping(false);
        }

        for (const event in connectionEvents) {
            socket.on(event, connectionEvents[event]);
        }

        newMessageEvents.forEach((event) => {
            socket.on(event, onNewMessage);
        });

        return () => {
            newMessageEvents.forEach((event) => {
                socket.off(event, onNewMessage);
            });

            for (const event in connectionEvents) {
                socket.off(event, connectionEvents[event]);
            }
        };
    }, []);

    return (
        <div
            className={createClassesFromArray([
                centerItems,
                'bg-primary',
                'md:min-w-[calc(100%-108px)]',
                'min-w-full',
                'flex-col',
                'h-full',
                'text-white',
            ])}
        >
            {disconnected && (
                <div className="bg-red w-full text-center">
                    You&apos;ve lost your connection.
                </div>
            )}
            <div className="flex items-center justify-between border-b-[2px] px-5 border-secondary h-[10%] w-[100%]">
                <div className="md:hidden">
                    <Whisper
                        placement="auto"
                        controlId="control-id-hover"
                        trigger="hover"
                        speaker={<Tooltip>Home</Tooltip>}
                    >
                        <IconButton
                            onClick={() => navigate('/')}
                            appearance="subtle"
                            className="bg-primary "
                            icon={<Icon as={BiArrowBack} />}
                            circle
                        />
                    </Whisper>
                </div>
                <div>
                    <h2 className="text-[1em] font-semibold">Anonymous User</h2>
                    {isTyping && <p className="mt-[-15px]">Typing</p>}
                </div>

                <Dropdown
                    placement="leftStart"
                    style={{ zIndex: 3 }}
                    renderToggle={MenuToggle}
                    noCaret
                >
                    <Dropdown.Item onClick={() => handleClose()}>
                        Close Chat
                    </Dropdown.Item>

                    <Dropdown.Item onClick={() => handleClose(true)}>
                        Find a new buddy
                    </Dropdown.Item>
                </Dropdown>
            </div>
            <div
                className={createClassesFromArray([
                    centerItems,
                    'flex-col',
                    'w-[90%]',
                    'h-full',
                    'flex-auto',
                ])}
            >
                <Chat />
            </div>
        </div>
    );
};

export default Anonymous;

Anonymous.propTypes = {
    onChatClosed: PropTypes.func,
};
