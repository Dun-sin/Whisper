import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { NEW_EVENT_CLOSE, NEW_EVENT_DELETE_MESSAGE, NEW_EVENT_DISPLAY, NEW_EVENT_EDIT_MESSAGE, NEW_EVENT_RECEIVE_MESSAGE } from '../../../constants.json'
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
import { createClassesFromArray } from 'src/lib/utils';

import useKeyPress, { ShortcutFlags } from 'src/hooks/useKeyPress';

const centerItems = `flex items-center justify-center`;

const Anonymous = ({ onChatClosed }) => {
    const { app, endSearch } = useApp();
    const { currentChatId } = app;
    const currentChatIdRef = useRef(currentChatId);
    const [isTyping, setIsTyping] = useState(false);
    const [autoSearchAfterClose, setAutoSearchAfterClose] = useState(false);
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

    socket.on(NEW_EVENT_DISPLAY, ({ isTyping, chatId }) => {
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
            .emit(NEW_EVENT_CLOSE, currentChatId, (err, chatClosed) => {
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

    useKeyPress(['x'], () => handleClose(), ShortcutFlags.ctrl | ShortcutFlags.shift);
    useKeyPress(['n'], () => handleClose(true), ShortcutFlags.ctrl);

    useEffect(() => {
        const newMessageEvents = [
            NEW_EVENT_RECEIVE_MESSAGE,
            NEW_EVENT_DELETE_MESSAGE,
            NEW_EVENT_EDIT_MESSAGE,
        ];

        function onNewMessage() {
            setIsTyping(false)
        }

        newMessageEvents.forEach((event) => {
            socket.on(event, onNewMessage);
        });

        return () => {
            newMessageEvents.forEach((event) => {
                socket.off(event, onNewMessage);
            });
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
                'h-screen',
                'text-white',
            ])}
        >
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
                    'h-[calc(100%-10%)]',
                    'mt-auto',
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

