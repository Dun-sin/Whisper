import React from 'react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import Chat from 'components/Chat';
import { ChatProvider } from 'context/ChatContext';
import  Dropdown   from 'rsuite/Dropdown';
import { useNavigate } from 'react-router-dom';


const centerItems = `flex items-center justify-center`;
 
 

const Anonymous = () => {
 
    const navigate = useNavigate();

    return (
        <ChatProvider>
            <div
                className={`bg-[#011627] min-w-[calc(100%-120px)] ${centerItems} flex-col max-h-[100vh] text-[#FFF]`}
            >
                <div className="flex justify-between border-b-[2px] border-secondary pt-[50px] pr-[60px] pl-[60px] pb-[15px] h-[13%] w-[100%]">
                    <p className="text-[1em] font-semibold">Anonymous User</p>
                    
                    <Dropdown placement="leftStart" style={{zIndex: 3  }}   icon={ <BiDotsVerticalRounded className="fill-[#f5f5f5] scale-[1.8]"></BiDotsVerticalRounded>} noCaret>
                        <Dropdown.Item    onClick={
                            ()=> {
                                navigate("/");
                            }} >
                            Close Chat
                        </Dropdown.Item>
                    </Dropdown>
                    

                    
                </div>
                <div
                    className={`flex-col w-[90%] h-[87%] ${centerItems} mt-auto`}
                >
                    <Chat />
                </div>
            </div>
        </ChatProvider>
    );
};

export default Anonymous;
