import { useContext, useState } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import Chat from 'components/Chat';
import Dropdown from 'rsuite/Dropdown';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from 'src/context/Context';
import { useChat } from 'src/context/ChatContext';
import { DialogContext } from 'src/context/DialogContext';

const centerItems = `flex items-center justify-center`;

const Anonymous = () => {
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const { setDialog } = useContext(DialogContext);
    const { closeChat } = useChat();
    const [isTyping, setIsTyping] = useState(false);

    socket.on('display', (isTyping) => {
        if (isTyping) {
            setIsTyping(true)
        } else {
            setIsTyping(false)
        }
    })

    const closeConnection = () => {
        const currentChatId = localStorage.getItem('currentChatId');

        if (!currentChatId) {
            navigate('/');
            return;
        }

        socket
            .timeout(30000)
            .emit('close', currentChatId, (err, chatClosed) => {
                if (err) {
                    alert('An error occured whiles closing chat.');
                    console.log(err);
                    return;
                }

                if (chatClosed) {
                    closeChat(currentChatId);
                }

                navigate('/');
                localStorage.removeItem('currentChatId')
            });
    }

    const handleClose = () => {
        setDialog({
            isOpen: true,
            text: 'Are you sure you want to close the chat?',
            noBtnText: 'Cancel',
            yesBtnText: 'Yes, close the chat',
            handler: () => closeConnection()
        })
    };

    return (
        <div
            className={`bg-[#011627] min-w-[calc(100%-108px)] ${centerItems} flex-col max-h-[100vh] text-[#FFF]`}
        >
            <div className="flex items-center justify-between border-b-[2px] px-8 border-secondary h-[10%] w-[100%]">
                <div>
                    <h2 className="text-[1em] font-semibold">Anonymous User</h2>
                    {isTyping && <p className='mt-[-15px]'>Typing</p>}
                </div>

                <Dropdown
                    placement="leftStart"
                    style={{ zIndex: 3 }}
                    icon={
                        <BiDotsVerticalRounded className="fill-[#f5f5f5] scale-[1.8]"></BiDotsVerticalRounded>
                    }
                    noCaret
                >
                    <Dropdown.Item onClick={handleClose}>
                        Close Chat
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
