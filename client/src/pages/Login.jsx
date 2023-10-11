import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useAuth } from 'src/context/AuthContext';

const centerStuffs = `flex flex-col justify-center items-center`;

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
            className={`bg-alice-blue dark:bg-primary h-[100vh] w-[100vw] text-primary dark:text-white ${centerStuffs}`}
        >
            {isLoading ? (
                <div className="uppercase py-5">Processing Login</div>
            ) : (
                <div className='flex gap-3 items-center'>
                    <button
                        className='py-3 px-6 bg-gray-100 dark:bg-secondary'
                        disabled={isLoading}
                        onClick={login}
                    >
                        Login
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={loginAnonymously}
                        className={`disabled:bg-slate-700 dark:text-white pt-[2px] font-light cursor-pointer hover:underline ${centerStuffs}`}
                    >
                        Login Anonymously
                    </button>
                </div>
            )}
        </div>
    );
};

export default Login;
