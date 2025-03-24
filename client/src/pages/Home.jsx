import React, { useState } from 'react';

import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

import Login from './Login';
import { useAuth } from 'src/context/AuthContext';
import { useDialog } from 'src/context/DialogContext';

const userID = Math.random().toFixed(12).toString(36).slice(2);

const Home = () => {
	const { dispatchAuth } = useAuth();
	const { setDialog } = useDialog();
	const navigate = useNavigate();

	const [isLogginWithEmail, setIsLogginWithEmail] = useState(false);

	function loginAnonymously() {
		dispatchAuth({
			type: 'LOGIN',
			payload: {
				loginType: 'anonymous',
				loginId: userID,
				email: null,
			},
		});
	}

	const handleLoginAnonymously = () => {
		setDialog({
			isOpen: true,
			text: 'Are you sure you want to login anonymously?',
			noBtnText: 'Cancel',
			yesBtnText: 'Yes, log in anonymously',
			handler: loginAnonymously,
		});
	};

	const handleBackClick = () => {
		navigate(-1); // Go back to the previous page
	};

	return (
		<div
			className={`bg-light dark:bg-primary h-[100vh] w-[100vw] text-primary dark:text-white flex`}
		>
			<div className="h-full w-full max-w-[1750px] flex">
				<div className="relative flex items-center justify-center flex-col sm:w-2/4 w-full gap-4 px-4">
					{isLogginWithEmail && (
						<div className="cursor-pointer fixed top-0 left-0 h-[44px] bg-[#162938] flex items-center left sm:w-2/4 w-full p-2">
							<IoIosArrowRoundBack color="white" size={30} onClick={handleBackClick} />
						</div>
					)}
					<div className="flex items-center justify-center flex-col gap-2 w-4/5 sm:w-full">
						<h1 className="font-bold text-4xl 2xl:text-5xl">WHISPER</h1>
						<p className="font-medium text-2xl text-center 2xl:text-3xl">
							Chat anonymously and safely with people for free
						</p>
					</div>

					{isLogginWithEmail ? (
						<Login />
					) : (
						<div className="flex gap-3 items-center w-4/5 sm:w-full justify-center flex-wrap">
							<button
								onClick={handleLoginAnonymously}
								className={`text-white bg-secondary h-10 px-10 font-light cursor-pointer rounded-md`}
							>
								Login Anonymously
							</button>
							<button
								className="h-10 px-10 bg-highlight rounded-md cursor-pointer"
								onClick={() => setIsLogginWithEmail(true)}
							>
								Login
							</button>
						</div>
					)}
				</div>
				<div className="h-full bg-secondary w-2/4 sm:flex hidden items-center justify-center px-4">
					<img src="/landing page image.jpg" className="max-h-[90vh] rounded-full w-auto object-cover" />
				</div>
			</div>
		</div>
	);
};

export default Home;
