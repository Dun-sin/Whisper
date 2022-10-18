import { useContext } from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import Chat from 'components/Chat';
import Dropdown from 'rsuite/Dropdown';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from 'src/context/Context';
import { useChat } from 'src/context/ChatContext';

const centerItems = `flex items-center justify-center`;

const Anonymous = () => {
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const { closeChat } = useChat();

    const handleClose = () => {
        if (!confirm('Are you sure you want to close this chat?')) {
            return;
        }

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
    };

    return (
        <div
            className={`bg-[#011627] min-w-[calc(100%-120px)] ${centerItems} flex-col max-h-[100vh] text-[#FFF]`}
        >
            <div className="flex justify-between border-b-[2px] border-secondary pt-[50px] pr-[60px] pl-[60px] pb-[15px] h-[13%] w-[100%]">
                <p className="text-[1em] font-semibold">Anonymous User</p>

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
            <div className={`flex-col w-[90%] h-[87%] ${centerItems} mt-auto`}>
                <Chat />
            </div>
        </div>
    );
};

export default Anonymous;
