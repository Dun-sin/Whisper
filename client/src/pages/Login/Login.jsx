import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MojoAuth from 'mojoauth-web-sdk';

// Redux
import { changeIsLogged } from '../../context/redux/Reducers/isLogged';
import { addID } from '../../context/redux/Reducers/idSlice';
import { useDispatch } from 'react-redux';

const centerStuffs = `flex flex-col justify-center items-center`;

const baseUrl = `${import.meta.env.VITE_SOCKET_URL}/user`;
const apiKey = import.meta.env.VITE_IMPORTANT;

const userID = Math.random().toFixed(12).toString(36).slice(2);

const Login = () => {
    const dispatch = useDispatch();
    const [loginStatus, setLoginStatus] = useState({
        email: null,
        status: 'none',
        error: false,
    });

    function loginUser(email) {
        setLoginStatus({
            ...loginStatus,
            status: 'loading',
            error: false,
        });

        axios
            .post(`${baseUrl}/add`, {
                email: email,
            })
            .then((res) => {
                if (res.status === 202) {
                    console.log('done');
                    setLoginStatus({
                        ...loginStatus,
                        status: 'complete',
                        error: false,
                        email,
                    });
                } else {
                    console.log('failed');
                    setLoginStatus({
                        ...loginStatus,
                        status: 'complete',
                        error: true,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                setLoginStatus({
                    ...loginStatus,
                    status: 'complete',
                    error: true,
                });
            });
    }

    const checkingUser = (email) => {
        axios
            .get(`${baseUrl}/find?email=${email}`)
            .then((res) => {
                if (res.status === 202) {
                    loginUser(email);
                } else if (res.status === 200) {
                    setLoginStatus({
                        ...loginStatus,
                        status: 'complete',
                        error: false,
                        email,
                    });
                    dispatch(addID(res.data.id));
                }
            })
            .catch((err) => {
                console.log(err);
                setLoginStatus({
                    ...loginStatus,
                    status: 'complete',
                    error: true,
                });
            });
    };

    useEffect(() => {
        // Regenerate userId on each page load/route change
        // This prevents us from re-using the same userId twice

        const mojoauth = new MojoAuth(`${apiKey}`, {
            source: [{ type: 'email', feature: 'magiclink' }],
        });
        mojoauth.signIn().then((payload) => {
            checkingUser(payload.user.email);
            document.getElementById('mojoauth-passwordless-form').remove();
        });
    }, []);

    useEffect(() => {
        if (loginStatus.status === 'complete' && !loginStatus.error) {
            if (loginStatus.email === null) {
                dispatch(addID(userID))
            }
            dispatch(
                changeIsLogged({
                    isLoggedIn: true,
                    loginType: loginStatus.email ? 'email' : 'anonymous',
                    loginId: userID,
                    email: loginStatus.email,
                })
            );
        }
    }, [loginStatus, dispatch]);

    const loginAnonymously = () => {
        setLoginStatus({
            status: 'complete',
            error: false,
            email: null,
        });
    };

    return (
        <div
            className={`bg-primary h-[100vh] w-[100vw] text-white ${centerStuffs}`}
        >
            <h1 className="text-[2em] font-semibold">Sign-in</h1>
            {loginStatus.status !== 'loading' && (
                <div className="pb-3">
                    <div id="mojoauth-passwordless-form" className=""></div>
                </div>
            )}
            {loginStatus.status === 'loading' && (
                <div className="uppercase py-5">Processing Login</div>
            )}
            <button
                disabled={loginStatus.status === 'loading'}
                onClick={loginAnonymously}
                className={`disabled:bg-slate-700 pb-[5px] bg-secondary text-white w-[370px] h-[50px] rounded-[10px] font-light ${centerStuffs}`}
            >
                Login Anonymously
            </button>
        </div>
    );
};

export default Login;
