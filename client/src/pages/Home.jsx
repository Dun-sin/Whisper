import React, { useState } from 'react';
import Login from './Login';
import { useAuth } from 'src/context/AuthContext';

const userID = Math.random().toFixed(12).toString(36).slice(2);

const Home = () => {
	const { dispatchAuth } = useAuth();
	const [isLogginWithEmail, setIsLogginWithEmail] = useState(false);
	const [showAnonymousConfirm, setShowAnonymousConfirm] = useState(false);

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

	return (
		<div className="bg-light dark:bg-primary h-screen w-screen text-primary dark:text-white flex">
			<div className="h-full w-full max-w-[1750px] flex">
				<div className="flex items-center justify-center flex-col sm:w-2/4 w-full gap-4 px-4">
					<div className="flex items-center justify-center flex-col gap-2 w-4/5 sm:w-full">
						<h1 className="font-bold text-4xl 2xl:text-5xl">WHISPER</h1>
						<p className="font-medium text-2xl text-center 2xl:text-3xl">
							Chat anonymously and safely with people for free
						</p>
					</div>

					{isLogginWithEmail ? (
						<Login setIsLogginWithEmail={setIsLogginWithEmail} />
					) : (
						<div className="flex gap-3 items-center w-4/5 sm:w-full justify-center flex-wrap">
							<button
								onClick={() => setShowAnonymousConfirm(true)}
								className="text-white bg-secondary h-10 px-10 font-light cursor-pointer rounded-md"
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
					<img
						src="/landing page image.jpg"
						alt="Landing page illustration"
						className="h-auto rounded-full w-auto object-cover"
					/>
				</div>
			</div>

			{showAnonymousConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
						<h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
							Login Anonymously
						</h2>
						<p className="mb-6 text-gray-700 dark:text-gray-300">
							Are you sure you want to login anonymously? This will create a temporary account.
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() => setShowAnonymousConfirm(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								No, go back
							</button>
							<button
								onClick={() => {
									loginAnonymously();
									setShowAnonymousConfirm(false);
								}}
								className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Yes, login anonymously
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Home;
