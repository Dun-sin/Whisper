import React, { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import { api } from '@/lib/axios';

const userID = Math.random().toString(36).slice(2, 14);
const OTP = Math.random().toString(36);

const Login = () => {
  const { dispatchAuth, isLoggedIn } = useAuth();
  const { loadUserSettings } = useApp();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>();

  const loginAnonymously = () => {
    setIsLoading(true);
    dispatchAuth({
      type: 'LOGIN',
      payload: {
        loginType: 'anonymous',
        loginId: userID,
        email: null,
      },
    });
    setIsLoading(false);
    router.push('/');
  };

  async function login() {
    setIsLoading(true);
    const email = emailRef.current?.value;
    try {
      const response = await api.post('/login', {
        email,
      });

      if (response.status === 200) {
        const data = await response.data;
        const userID = data.id;

        dispatchAuth({
          type: 'LOGIN',
          payload: {
            loginType: 'email',
            loginId: userID,
            email,
          },
        });
        try {
          const userData = await api.get(`/profile/${email}`);
          loadUserSettings(userData.data?.settings);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setIsLoading(false);
        throw new Error('Login failed');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Error logging in:', err);
    }
  }

  useEffect(() => {
    isLoggedIn && router.push('/');
  }, [isLoggedIn]);

  return (
    <div className='bg-light dark:bg-primary h-[100vh] w-[100vw] text-primary dark:text-white flex'>
      <div className='h-full w-full max-w-[1750px] flex'>
        <div className='flex items-center justify-center flex-col sm:w-2/4 w-full gap-4 px-4'>
          <div className='flex items-center justify-center flex-col gap-2 w-4/5 sm:w-full'>
            <h1 className='font-bold text-4xl 2xl:text-5xl'>WHISPER</h1>
            <p className='font-medium text-2xl text-center 2xl:text-3xl'>
              Chat anonymously and safely with people for free
            </p>
          </div>
          {isLoading ? (
            <div className='uppercase py-5'>Processing Login</div>
          ) : (
            <>
              <div className='w-4/5'></div>
              <div className='flex gap-3 items-center w-4/5 sm:w-full justify-center flex-wrap'>
                <button
                  disabled={isLoading}
                  onClick={loginAnonymously}
                  className={`text-white bg-secondary h-10 px-10 font-light cursor-pointer rounded-md`}
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
            </>
          )}
        </div>
        <div className='h-full bg-secondary w-2/4 sm:flex hidden items-center justify-center px-4 relative'>
          <Image
            src='/landing page image.jpg'
            className='h-auto rounded-full w-auto object-cover'
            alt='Landing Page Image'
            fill
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
