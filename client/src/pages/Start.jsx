import { useEffect } from 'react';
import { RiUserSearchLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from 'src/context/AppContext';

const centerElement = ' flex flex-col items-center justify-center';

const Start = () => {
    const { app } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (app.isSearching || app.currentChatId) {
            navigate('/founduser');
        }
    }, [])
    return (
        <div
            className={
                `bg-primary min-w-[calc(100%-108px)] text-white mdl:min-h-[86.5vh]` +
                centerElement
            }
        >
            <RiUserSearchLine
                style={{ transform: 'scale(8)' }}
                className="text-secondary mb-6"
            />
            <h1 className="text-[calc(1.2vh+1.2vh+1.2vmin)]">Search For Someone</h1>

            {/* from the below link user will trigger search of another user*/}
            <Link
                to="/founduser"
                className={
                    'hover:no-underline hover:text-black font-medium text-black text-[1.5em] bg-[#FF9F1C] w-[8em] h-[2.3em] mt-[-5px] rounded-[30px]' +
                    centerElement
                }
            >
                Start
            </Link>
        </div>
    );
};

export default Start;
