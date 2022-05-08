import React from 'react'

import { BsFillInfoCircleFill } from 'react-icons/bs'

const centerStuffs = `flex flex-col justify-center items-center`

const Login = () => {
  return (
    <div className={`bg-primary h-[100vh] w-[100vw] text-white ${centerStuffs}`}>
      <h1 className='text-[2em] font-semibold mb-[20px]'>Signin / Login</h1>
      <form action="" className={`${centerStuffs}`}>
        <input type="email" name="email" placeholder='Enter your email....' className='h-[30px] w-[290px] p-[20px] rounded-[10px] text-black' />
        <button type="submit" className={`mt-[10px] bg-[#FF9F1C] text-primary h-[30px] w-[120px] rounded-[10px]`}>Login</button>
      </form>
      <a className='flex items-center' href='/searchuser'>
        <p>Login Anonymously</p>
        <BsFillInfoCircleFill className='ml-[5px]' />
      </a>
    </div>
  )
}

export default Login;