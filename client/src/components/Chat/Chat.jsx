import React from 'react'


import { IoSend } from 'react-icons/io5';

const Chat = () => {
  return (
    <div className='w-[100%] pb-[25px]'>
      <div className="displayMessgaes">
      </div>
      <form className='flex justify-center items-center'>
        <input type="text" placeholder='Send a Message.....' className='h-[65px] focus:outline-none rounded-[15px] bg-secondary w-[100%] text-white pl-[22px] pr-[22px] text-[18px]' />
        <button className='bg-[#FF9F1C] h-[65px] w-[70px] flex justify-center items-center rounded-[10px]'>
          <IoSend className='fill-primary scale-[2]' />
        </button>
      </form>
    </div>
  )
}

export default Chat;