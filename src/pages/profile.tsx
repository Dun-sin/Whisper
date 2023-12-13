import { SetStateAction, useEffect, useRef, useState } from 'react';

import { Icon } from '@iconify/react';

import { useAuth } from '@/context/AuthContext';
import SignupAnonUser from '@/components/SignupAnonUser';
import { api } from '@/lib/axios';
import PageWrapper from '@/components/PageWrapper';

const Profile = () => {
  const [username, setUsername] = useState('Anonymous');
  const [profileResponse, setProfileResponse] = useState();
  const [loginType, setLoginType] = useState<'email' | 'anonymous' | null>(
    null
  );

  const { authState, dispatchAuth } = useAuth();

  const aboutRef = useRef<HTMLTextAreaElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);

  const { email } = authState;

  const getProfileData = async (email: string) => {
    try {
      const response = await api.get(`/profile/${email}`);
      const { aboutMe, age, gender, username } = response.data;

      setUsername(username);
      if (!aboutRef.current || !ageRef.current || !genderRef.current) {
        return;
      }

      aboutRef.current.value = aboutMe || '';
      ageRef.current.value = age;
      genderRef.current.value = gender;
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleUserName = (e: { target: { value: SetStateAction<string> } }) =>
    setUsername(e.target.value);

  const handleUpdateProfile = async () => {
    if (!aboutRef.current || !ageRef.current || !genderRef.current) {
      return;
    }
    const data = {
      email,
      username,
      aboutMe: aboutRef.current.value,
      gender: genderRef.current.value,
      age: Number(ageRef.current.value),
    };

    try {
      const response = await api.post('/profile', data);
      console.log(response.data.message);
      setProfileResponse(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  function logOut() {
    dispatchAuth({
      type: 'LOGOUT',
    });
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await api.delete('/deleteUser', {
        data: { email },
      });

      console.log(response.data.message);
      logOut();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (email === null || email === '') {
      return;
    }
    getProfileData(email);
  }, [email]);

  useEffect(() => {
    setLoginType(JSON.parse(localStorage.getItem('auth') as string).loginType);
  }, []);

  return (
    <PageWrapper>
      <div
        className={`bg-light dark:bg-primary md:min-w-[calc(100%-120px)] flex items-center justify-center flex-col md:min-h-screen min-h-[calc(100vh-70px)] text-primary dark:text-white gap-3`}
      >
        {loginType === 'anonymous' ? (
          <SignupAnonUser />
        ) : (
          <>
            <section className='min-w-[300px] max-w-[400px] w-[40%] px-10 py-8 rounded-2xl flex flex-col justify-center items-center bg-clip-padding backdrop-filter backdrop-blur-2xl bg-gray-100 dark:bg-opacity-5 dark:bg-gray-300'>
              <Icon
                icon='solar:user-circle-broken'
                className='text-highlight h-20 w-20'
              />

              <input
                className='outline-none bg-transparent w-fit text-center text-2xl placeholder:text-2xl placeholder:text-white'
                onChange={handleUserName}
                placeholder={username}
                value={username}
              />

              <div className='w-full flex flex-col gap-4'>
                <textarea
                  className='bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-5 border border-primary dark:border-white text-secondary dark:text-white my-2 bg-transparent outline-none tracking-wider resize-none indent-2 p-2 rounded-xl h-28 w-full placeholder:tracking-widest placeholder:text-center'
                  placeholder='Write something about you...'
                  ref={aboutRef}
                />
                <section className='text-lg'>
                  <div className='border-b-2 border-gray-700 pb-2 flex justify-between tracking-wide items-center'>
                    <label
                      className='text-primary dark:text-white'
                      htmlFor='gender'
                    >
                      Gender
                    </label>
                    <select
                      id='genderSelect'
                      ref={genderRef}
                      className='border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 bg-transparent dark:bg-gray-700 border-gray-600 placeholder-gray-400 text-primary dark:text-white'
                      defaultValue='Unknown'
                    >
                      <option value='Unknown'>Unknown</option>
                      <option value='Female'>Female</option>
                      <option value='Male'>Male</option>
                    </select>
                  </div>
                  <div className='flex justify-between tracking-wide items-center'>
                    <label
                      className='text-primary dark:text-white'
                      htmlFor='age'
                    >
                      Age
                    </label>
                    <input
                      type='number'
                      placeholder='19'
                      className='outline-none bg-transparent text-right'
                      ref={ageRef}
                      min='1'
                      onChange={e => {
                        const value = e.target.value as unknown as number;
                        if (value < 1) {
                          e.target.value = '1';
                        }
                      }}
                    />
                  </div>
                </section>
              </div>
            </section>
            <button
              className='border min-w-[300px] max-w-[400px] w-[40%] p-2 text-md rounded-xl border-green-500 text-green-500 hover:bg-green-500 hover:text-white dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white'
              onClick={handleUpdateProfile}
            >
              Save changes
            </button>
            <button
              className='border min-w-[300px] max-w-[400px] w-[40%] p-2 text-md rounded-xl border-red text-red hover:bg-red hover:text-white'
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </button>
            {profileResponse ? (
              <div>
                <p className='text-green-300'>Profile Updated!</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default Profile;
