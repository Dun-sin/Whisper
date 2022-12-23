import { useEffect, useState } from 'react';

import { Icon } from '@iconify/react';
import Chat from '../components/Chat';

const Friends = () => {
    const [currentChatIdForFriend, setCurrentChatIdForFriend] = useState(null);

    useEffect(() => {
        setCurrentChatIdForFriend(null);
    }, []);

    return (
        <div className="w-full bg-primary md:min-h-screen min-h-[calc(100vh-70px)] flex flex-row text-white">
            <section className="p-2 w-[25%] h-full border-r border-slate-400">
                <h1>Friends</h1>
                <section className="flex flex-col">
                    <div className="bg-[#FF3A46] h-10 w-full rounded-sm flex items-center justify-between p-2">
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
            </section>
            <hr />
            <section className="w-[75%] h-full">
                <Chat
                    isAnonymous={false}
                    currentChatIdForFriend={currentChatIdForFriend}
                />
            </section>
        </div>
    );
};

export default Friends;
