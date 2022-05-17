import React from 'react'

const centerStuffs = `flex flex-col justify-center items-center`

const Login = () => {
  return (
    <div className={`bg-primary h-[100vh] w-[100vw] text-white ${centerStuffs}`}>
      <h1 className='text-[2em] font-semibold mb-[10px]'>Signin</h1>
      <div className={`${centerStuffs}`}>
        <input type="email" name="email" placeholder='Enter your email....' className='h-[30px] w-[290px] p-[20px] rounded-[10px] text-black' />
        <div className="flex items-center justify-between  w-[290px]">
          <button type="submit" className={`mt-[10px] bg-[#FF9F1C] text-primary h-[30px] w-[120px] rounded-[10px]`}>Login</button>
          <a className='text-[11.5px] mt-[15px]' href='/searchuser'>Login Anonymously</a>
        </div>
      </div>
    </div>
  )
}

export default Login;