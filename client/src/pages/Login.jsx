import React, { useRef, useState } from 'react'
import { decrypt, encrypt, generateCode } from 'src/lib/utils';

import { PropTypes } from 'prop-types';
import { api } from 'src/lib/axios';
import { useAuth } from 'src/context/AuthContext';

const Login = () => {
  const { dispatchAuth } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toInputCode, setToInputCode] = useState(false)
  const [email, setEmail] = useState(null)

  const emailRef = useRef();
  const codeRef = useRef();

  const handleEmailInput = async () => {
    const email = emailRef.current.value

    if (!email || email.length === '') {
      setError('Email not provided')
      return
    }

    try {
      setIsLoading(true)
      const code = generateCode()
      const response = await api.post('/code', {
        email,
        code
      })

      localStorage.setItem('code', encrypt(code))

      if (response.status === 200) {
        setToInputCode(true)
        setEmail(email)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
      // eslint-disable-next-line require-atomic-updates
      emailRef.current.value = ''
    }
  }

  const handleCodeInput = async () => {
    const inputedCode = codeRef.current.value
    if (!inputedCode || inputedCode.length === '') {
      setError('Email not provided')
      return
    }

    try {
      setIsLoading(true)
      const code = decrypt(localStorage.getItem('code'))
      if (inputedCode === code) {
        const response = await api.post('/login', {
          email,
        });

        const data = await response.data;
        if (response.status === 200) {
          const id = data.id;

          dispatchAuth({
            type: 'LOGIN',
            payload: {
              loginId: id,
              loginType: 'email',
              email,
            },
          });
        } else if (response.status === 500) {
          throw new Error(data.message);
        }
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className='flex flex-col gap-3'>
      {error && <p className='text-red'>{error}</p>}
      {toInputCode ?
        <InputMethod
          refProp={codeRef}
          isLoading={isLoading}
          handleSubmit={handleCodeInput}
          inputValue={{ type: 'text', name: 'code', placeholder: "Enter Code Recieved" }}

        />
        :
        <InputMethod
          refProp={emailRef}
          isLoading={isLoading}
          handleSubmit={handleEmailInput}
          inputValue={{ type: "email", name: "email", placeholder: "Enter Your Email" }}
        />}
    </section>
  )
}

export default Login

const InputMethod = ({ refProp, isLoading, handleSubmit, inputValue }) => {
  return <>
    {inputValue.name === 'code' && <p className='text-center'>Check Your Email For the Code</p>}
    <label htmlFor="email" className="w-full flex items-center justify-center">
      <input
        type={inputValue.type}
        className="w-full max-w-[600px] min-w-[300px] p-3 rounded-md text-black border-highlight border"
        name={inputValue.name}
        ref={refProp}
        placeholder={inputValue.placeholder}
      />
    </label>
    <button
      disabled={isLoading}
      onClick={handleSubmit}
      className="bg-highlight w-[80%] max-w-[400px] min-w-[300px] py-2 rounded-md"
    >
      {isLoading ? 'Loading' : 'Submit'}
    </button>
  </>
}

InputMethod.propTypes = {
  refProp: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
  isLoading: PropTypes.bool,
  handleSubmit: PropTypes.func,
  inputValue: PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
  })
}