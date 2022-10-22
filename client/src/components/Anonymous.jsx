import { useContext, useEffect, useRef, useState } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import Chat from 'components/Chat';
import Dropdown from 'rsuite/Dropdown';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from 'src/context/Context';
import { useChat } from 'src/context/ChatContext';
import PropTypes from 'prop-types';

const centerItems = `flex items-center justify-center`;

const Anonymous = ({ onChatClosed }) => {
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [autoSearchAfterClose, setAutoSearchAfterClose] = useState(false);
    const autoSearchRef = useRef();
    autoSearchRef.current = autoSearchAfterClose;

    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const { closeChat } = useChat();

    useEffect(() => {
        setCurrentChatId(localStorage.getItem('currentChatId'));
    }, []);

    socket.on('display', ({ isTyping, chatId }) => {
        // eslint-disable-next-line curly
        if (chatId !== currentChatId) return;
        isTyping ? setIsTyping(true) : setIsTyping(false);
    });

    const handleClose = (autoSearch = false) => {
        if (!confirm('Are you sure you want to close this chat?')) {
            return;
        }

        const currentChatId = localStorage.getItem('currentChatId');

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
                    console.log(err);

                    setAutoSearchAfterClose(false);
                    return;
                }

                if (chatClosed) {
                    closeChat(currentChatId);
                }

                localStorage.removeItem('currentChatId');

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

    return (
        <div
            className={`bg-[#011627] min-w-[calc(100%-108px)] ${centerItems} flex-col max-h-[100vh] text-[#FFF]`}
        >
            <div className="flex items-center justify-between border-b-[2px] px-8 border-secondary h-[10%] w-[100%]">
                <div>
                    <h2 className="text-[1em] font-semibold">Anonymous User</h2>
                    {isTyping && <p className="mt-[-15px]">Typing</p>}
                </div>

                <Dropdown
                    placement="leftStart"
                    style={{ zIndex: 3 }}
                    icon={
                        <BiDotsVerticalRounded className="fill-[#f5f5f5] scale-[1.8]"></BiDotsVerticalRounded>
                    }
                    noCaret
                >
                    <Dropdown.Item onClick={() => handleClose()}>
                        Close Chat
                    </Dropdown.Item>

                    {/* TODO: Use a checkbox in modal dialog instead */}
                    <Dropdown.Item onClick={() => handleClose(true)}>
                        Close &apos;n find new buddy
                    </Dropdown.Item>
                </Dropdown>
            </div>
            <div className={`flex-col w-[90%] h-[90%] ${centerItems} mt-auto`}>
                <Chat />
            </div>
        </div>
    );
};

export default Anonymous;

Anonymous.propTypes = {
    onChatClosed: PropTypes.func,
};
