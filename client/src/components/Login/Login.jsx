import React, { useEffect } from 'react'
import MojoAuth from "mojoauth-web-sdk"

// redux
import { changeIsLogged } from '../../redux/Reducers/isLogged';
import { addID } from '../../redux/Reducers/idSlice';
import { useDispatch } from 'react-redux';

import { v4 as uuidv4 } from 'uuid';
import { api } from '../../app/common';
import { useRef } from 'react';

/**
 * NOTES:
 * It's better to use async/await as much as possible to avoid callback hell
 * and to promote a more readable code
 */


const apiKey = process.env.NODE_ENV === 'development' ? "test-ba46e805-0e16-4206-9407-8ee8f697aff1" : process.env.REACT_APP_IMPORTANT;

let userID = uuidv4();

const Login = () => {
  const dispatch = useDispatch();

  const mojoAuthForm = useRef(null);

  useEffect(() => {
    async function handleAuth() {
      const mojoauth = new MojoAuth(apiKey, {
        source: [{ type: 'email', feature: 'magiclink' }]
      });

      try {
        const payload = await mojoauth.signIn()

        if (payload) {
          const { user } = payload
          checkingUser(user.email)
          mojoAuthForm.current?.remove()
        }
      } catch (e) {
        alert('MojoAuth failed!')
        console.log('from here!!!', e);
      }
    }

    handleAuth()
  }, [])

  const loginUser = async (email) => {
    try {
      const res = await api.post('/user/add', {
        email
      })
      if (res.status === 202) {
        console.log('done')
        dispatch(changeIsLogged(true))
      } else {
        console.log('failed')
      }
    } catch (err) {
      console.log(err)
    }
  }

  const checkingUser = async (email) => {
    try {
      const res = await api.get(`/user/find?email=${email}`);
      if (res.status === 202) {
        await loginUser(email)
      }

      if (res.status === 200) {
        dispatch(changeIsLogged(true))
        dispatch(addID(res.data.id))
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className={`bg-primary h-[100vh] w-[100vw] text-white centered`}>
      <h1 className='text-[2em] font-semibold'>Sign-in</h1>
      <div ref={mojoAuthForm} id="mojoauth-passwordless-form" className="">
        Loading...
      </div>
      {/* <a className={'pb-[5px] bg-secondary text-white h-[30px] w-[370px] h-[50px] rounded-[10px] font-light centered'} href='/searchuser'>Login Anonymously</a> */}
    </div>
  )
}

export default Login;