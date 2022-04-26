import React from 'react'


import { useDispatch, useSelector } from 'react-redux'
import { messageAction } from './Actions/messageAction';

import { DebounceInput } from 'react-debounce-input'

import { IoSend } from 'react-icons/io5';
import { useState } from 'react';

const Chat = () => {
  const dispatch = useDispatch();
  const state = useSelector(state => state);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState('123456')

  const handleInput = e => {
    setMessage(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (message === '') return
    // const d = new Date();
    // const date = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    // dispatch(messageAction(senderId, message, date, 'anon'));
    setMessage('')
    console.log(state);
    handleMessages();
  }

  const handleMessages = async () => {
    const findId = await state.messages.find(item => item.id === senderId);
    setMessages(findId.message);
  }

  return (
    <div className='w-[100%] h-[90%] pb-[25px]'>
      <div className="displayMessgaes overflow-y-scroll h-[85%]">
        <p className='text-[16px] font-semibold mb-[20px] text-center'>Connected with a random User, Send hi</p>
        {/* {messages.map(i => (
          <p className='bg-[#FF9F1C] p-[10px] mb-[15px] w-[200px] rounded-[20px] text-black'>{i}</p>
        ))} */}
      </div>
      <form className='flex justify-center items-center mt-[40px]'>
        <DebounceInput debounceTimeout={350} minLength={2} placeholder='Send a Message.....' className='h-[65px] focus:outline-none rounded-[15px] bg-secondary w-[100%] text-white pl-[22px] pr-[22px] text-[18px]' value={message} onChange={handleInput} />
        <button type="submit" onClick={handleSubmit} className='bg-[#FF9F1C] h-[65px] w-[70px] flex justify-center items-center rounded-[10px]'>
          <IoSend className='fill-primary scale-[2]' />
        </button>
      </form>
    </div>
  )
}

export default Chat;
