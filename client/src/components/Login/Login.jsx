import React, { useEffect } from 'react'
import axios from 'axios';
import MojoAuth from "mojoauth-web-sdk"

// redux
import { changeIsLogged } from '../../redux/Reducers/isLogged';
import { addID } from '../../redux/Reducers/idSlice';
import { useDispatch } from 'react-redux';

const centerStuffs = `flex flex-col justify-center items-center`

const baseUrl = 'http://localhost:4000/user';
const apiKey = process.env.REACT_APP_IMPORTANT;

let userID = '' + Math.random().toFixed(12).toString(36).slice(2);

const Login = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const mojoauth = new MojoAuth("test-d4a1c830-a65f-4c43-a871-abafcc31066d", {
      source: [{ type: 'email', feature: 'magiclink' }]
    });
    mojoauth.signIn().then(payload => {
      checkingUser(payload.user.email)
      document.getElementById("mojoauth-passwordless-form").remove();
    })
  }, [])

  const checkingUser = (email) => {
    axios.get(`${baseUrl}/find?email=${email}`)
      .then(res => {
        if (res.status === 202) {
          loginUser(email)
          function loginUser(email) {
            axios.post(`${baseUrl}/add`, {
              email: email
            })
              .then(res => {
                if (res.status === 202) {
                  console.log('done')
                  dispatch(changeIsLogged(true))
                } else {
                  console.log('failed')
                }
              })
              .catch(err => console.log(err))
          }
        } else if (res.status === 200) {
          dispatch(changeIsLogged(true))
          dispatch(addID(res.data.id))
        }
      })
      .catch(err => console.log(err))
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