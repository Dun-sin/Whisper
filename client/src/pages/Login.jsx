import React, { useEffect, useState } from 'react';
import MojoAuth from 'mojoauth-web-sdk';

// Redux
import { useAuth } from 'src/context/AuthContext';
import { api } from 'src/lib/axios';

const centerStuffs = `flex flex-col justify-center items-center`;

const apiKey = import.meta.env.VITE_IMPORTANT;

const userID = Math.random().toFixed(12).toString(36).slice(2);

const Login = () => {
    const { login } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    function loginWithEmail(email) {
        setIsLoggingIn(true);
        api.post('/login', {
            email,
        })
            .then((res) => {
                setIsLoggingIn(false);
                if (res.status === 200) {
                    login({
                        loginType: 'email',
                        loginId: userID,
                        email,
                    });
                }
            })
            .catch((err) => {
                setIsLoggingIn(false);
                throw Error(err);
            });
    }

    function loginAnonymously() {
        login({
            loginType: 'anonymous',
            loginId: userID,
            email: null,
        });
    }

    useEffect(() => {
        // Regenerate userId on each page load/route change
        // This prevents us from re-using the same userId twice

        const mojoauth = new MojoAuth(`${apiKey}`, {
            source: [{ type: 'email', feature: 'magiclink' }],
        });

        mojoauth.signIn().then((payload) => {
            loginWithEmail(payload.user.email);
            document.getElementById('mojoauth-passwordless-form')?.remove();
        });
    }, []);

    return (
        <div
            className={`bg-primary h-[100vh] w-[100vw] text-white ${centerStuffs}`}
        >
            {isLoggingIn ? (
                <div className="uppercase py-5">Processing Login</div>
            ) : (
                <div>
                    <div id="mojoauth-passwordless-form" className=""></div>
                    <button
                        disabled={isLoggingIn}
                        onClick={loginAnonymously}
                        className={`disabled:bg-slate-700 text-white pt-[2px] font-light cursor-pointer hover:underline ${centerStuffs}`}
                    >
                        Login Anonymously
                    </button>
                </div>
            )}
        </div>
    );
};

export default Login;
