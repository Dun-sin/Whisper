import React, { useRef, useEffect } from 'react'
import axios from 'axios';
import Sawo from "sawo"

// redux
import { changeIsLogged } from '../../redux/Reducers/isLogged';
import { addID } from '../../redux/Reducers/idSlice';
import { useDispatch } from 'react-redux';

const centerStuffs = `flex flex-col justify-center items-center`

const baseUrl = 'http://localhost:4000/user';
const apiKey = process.env.REACT_APP_IMPORTANT;

const date = new Date()
let userID = '' + Math.floor(+`${date.getTime()}${date.getDate()}${date.getMonth()}` / 1000);

const Login = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    var config = {
      containerID: "sawo-container",
      identifierType: "email",
      apiKey: '' + apiKey,
      onSuccess: (payload) => {
        checkingUser(payload.identifier)
        dispatch(changeIsLogged(true))
      },
    };
    let sawo = new Sawo(config)
    sawo.showForm()

    const checkingUser = (email) => {
      axios.get(`${baseUrl}/find?email=${email}`)
        .then(res => {
          console.log(res.status)
          if (res.status === 202) {
            loginUser(userID, email)

            function loginUser(id, email) {
              axios.post(`${baseUrl}/add`, {
                id: id,
                email: email
              })
                .then(res => {
                  if (res.status === 202) {
                    console.log('done')
                  } else {
                    console.log('failed')
                  }
                })
                .catch(err => console.log(err))
            }
          } else if (res.status === 200) {
            dispatch(addID(res.data.id))

          }
        })
        .catch(err => console.log(err))
    }
  }, [])

  return (
    <div className={`bg-primary h-[100vh] w-[100vw] text-white ${centerStuffs}`}>
      <h1 className='text-[2em] font-semibold '>Sign-in</h1>
      <div id="sawo-container" style={{ minHeight: "235px", width: "400px" }}></div>
      <a className={`pb-[5px] bg-secondary text-white h-[30px] w-[370px] h-[50px] rounded-[10px] font-light ${centerStuffs}`} href='/searchuser'>Login Anonymously</a>
    </div>
  )
}

export default Login;