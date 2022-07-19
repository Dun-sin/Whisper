import React, { useEffect, useState } from 'react'
import axios from 'axios';
import MojoAuth from "mojoauth-web-sdk"

// redux
import { changeIsLogged } from '../../redux/Reducers/isLogged';
import { addID } from '../../redux/Reducers/idSlice';
import { useDispatch } from 'react-redux';

const centerStuffs = `flex flex-col justify-center items-center`

const baseUrl = `${process.env.REACT_APP_SOCKET_URL}/user`;
const apiKey = process.env.REACT_APP_IMPORTANT;

let userID = '' + Math.random().toFixed(12).toString(36).slice(2);

const Login = () => {
  const dispatch = useDispatch();
  const [loginStatus, setLoginStatus] = useState({
    email: null,
    status: 'none',
    error: false
  })

  useEffect(() => {
    const mojoauth = new MojoAuth(`${apiKey}`, {
      source: [{ type: 'email', feature: 'magiclink' }]
    });
    mojoauth.signIn().then(payload => {
      checkingUser(payload.user.email)
      document.getElementById("mojoauth-passwordless-form").remove();
    })
  }, [])

  useEffect(() => {
    if (loginStatus.status === 'complete' && !loginStatus.error) {
      dispatch(changeIsLogged({
        isLoggedIn: true,
        loginType: 'email',
        loginId: userID,
        email: loginStatus.email,
      }))
    }
  }, [loginStatus, dispatch])

  const checkingUser = (email) => {
    axios.get(`${baseUrl}/find?email=${email}`)
      .then(res => {
        if (res.status === 202) {
          loginUser(email)
          function loginUser(email) {
            setLoginStatus({
              ...loginStatus,
              status: 'loading',
              error: false,
            })

            axios.post(`${baseUrl}/add`, {
              email: email
            })
              .then(res => {
                if (res.status === 202) {
                  console.log('done')
                  setLoginStatus({
                    ...loginStatus,
                    status: 'complete',
                    error: false,
                    email
                  })
                } else {
                  console.log('failed')
                  setLoginStatus({
                    ...loginStatus,
                    status: 'complete',
                    error: true
                  })
                }
              })
              .catch(err => {
                console.log(err)
                setLoginStatus({
                  ...loginStatus,
                  status: 'complete',
                  error: true
                })
              })
          }
        } else if (res.status === 200) {
          setLoginStatus({
            ...loginStatus,
            status: 'complete',
            error: false,
            email
          })
          dispatch(addID(res.data.id))
        }
      })
      .catch(err => {
        console.log(err)
        setLoginStatus({
          ...loginStatus,
          status: 'complete',
          error: true
        })
      })
  }

  return (
    <div className={`bg-primary h-[100vh] w-[100vw] text-white ${centerStuffs}`}>
      <h1 className='text-[2em] font-semibold'>Sign-in</h1>
      <div id="mojoauth-passwordless-form" className=""></div>
      {/* <a className={`pb-[5px] bg-secondary text-white h-[30px] w-[370px] h-[50px] rounded-[10px] font-light ${centerStuffs}`} href='/searchuser'>Login Anonymously</a> */}
    </div>
  )
}

export default Login;