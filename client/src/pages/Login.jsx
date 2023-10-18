import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useAuth } from 'src/context/AuthContext';

const userID = Math.random().toFixed(12).toString(36).slice(2);

const Login = () => {
    const { dispatchAuth } = useAuth()
    const { login, isLoading } = useKindeAuth()


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
        <div
            className={`bg-light dark:bg-primary h-[100dvh] w-[100vw] text-primary dark:text-white flex`}
        >
					<div className='h-full w-full max-w-[1750px] flex'>
						<div className='flex items-center justify-center flex-col sm:w-2/4 w-full gap-4 px-4'>
							<div className='flex items-center justify-center flex-col gap-2 w-4/5 sm:w-full'>
								<h1 className='font-bold text-4xl 2xl:text-5xl'>WHISPER</h1>
								<p className='font-medium text-2xl text-center 2xl:text-3xl'>Chat anonymously and safely with people for free</p>
							</div>
							{isLoading ? ( 
								<div className="uppercase py-5">Processing Login</div>
								) : (
								<div className='flex gap-3 items-center w-4/5 sm:w-full justify-center flex-wrap'>
									<button
												disabled={isLoading}
												onClick={loginAnonymously}
												className={`dark:text-white bg-secondary h-10 px-10 font-light cursor-pointer rounded-md`}
										>
												Login Anonymously
										</button>
										<button
												className='h-10 px-10 bg-highlight rounded-md cursor-pointer'
												disabled={isLoading}
												onClick={login}
										>
												Login
										</button>
								</div>
							)}
						</div>
						<div className='h-full bg-secondary w-2/4 sm:flex hidden items-center justify-center px-4'>
							<img src='/landing page image.jpg' className='h-auto rounded-full w-auto object-cover'/>
						</div>
					</div>
        </div>
    );
};

export default Login;
