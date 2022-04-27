import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client';

import './Chat.css'

import { messageAction } from '../../redux/Actions/messageAction'

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';

const socekt = io.connect('http://localhost:4000');

const Chat = () => {
  const dispatch = useDispatch();
  const state = useSelector(state => state);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState('123456');
  const [isSender, setIsSender] = useState(false);

  const handleInput = e => {
    setMessage(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (message === '') return
    const d = new Date();
    const date = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    dispatch(messageAction(senderId, message, date, 'anon'));
    setMessage('')
  }

  useEffect(() => {
    const handleMessages = async () => {
      console.log(state.messages);
      const findId = await state.messages.find(item => item.id === senderId);
      setMessages(findId.message);
      if (findId.length === 0) {
        setIsSender(false);
      } else {
        setIsSender(true);
      }
    }
    handleMessages();
  }, [state.messages, senderId])


  return (
    <div className='w-[100%] h-[90%] pb-[25px]'>
      <ScrollToBottom className="displayMessgaes h-[85%] ">
        <p className='text-[0.8em] font-semibold mb-[20px] text-center'>Connected with a random User, Send hi</p>
        {messages.map((i, index) => (
          <p key={index} className={`bg-[#FF9F1C] p-[10px] mb-[15px] w-[200px] rounded-[20px] text-primary ${isSender ? 'ml-auto' : ''}`}>{i}</p>
        ))}
      </ScrollToBottom>
      <form className='flex justify-center items-center mt-[40px]'>
        <input placeholder='Send a Message.....' className='h-[65px] focus:outline-none rounded-[15px] bg-secondary w-[100%] text-white pl-[22px] pr-[22px] text-[18px]' value={message} onChange={handleInput} />
        <button type="submit" onClick={handleSubmit} className='bg-[#FF9F1C] h-[65px] w-[70px] flex justify-center items-center rounded-[10px]'>
          <IoSend className='fill-primary scale-[2]' />
        </button>
      </form>
    </div>
  )
}

export default Chat;
