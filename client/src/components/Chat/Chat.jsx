import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client';

import './Chat.css'

import { messageAction } from '../../redux/Actions/messageAction'

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';

const socket = io.connect('http://localhost:4000');

const Chat = () => {
  const d = new Date();
  const dispatch = useDispatch();
  const state = useSelector(state => state);
  const date = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

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
    socket.on('connect', () => {
      console.log(socket.id);
    })
    dispatch(messageAction(senderId, message, date, 'anon'));
    setMessage('')
  }

  useEffect(() => {
    const available = state.messages.length === 0;
    const handleMessages = async () => {
      const findId = await state.messages.find(item => item.id === senderId);
      setMessages(findId.message);
      if (findId.length === 0) {
        setIsSender(false);
      } else {
        setIsSender(true);
      }
    }
    !available && handleMessages();
  }, [state.messages, senderId])


  return (
    <div className='w-[100%] h-[90%] pb-[25px]'>
      <ScrollToBottom className="displayMessgaes h-[85%] ">
        <p className='text-[0.8em] font-semibold mb-[20px] text-center'>Connected with a random User, Send hi</p>
        {messages.map((i, index) => (
          <div key={index} className={`relative mb-[15px] w-[250px] text-primary ${isSender ? 'ml-auto' : ''}`}>
            <p className='bg-[#FF9F1C] rounded-[20px] p-[15px] break-all'>{i.message}</p>
            <p className='text-white ml-[75%] text-[12px]'>{i.time}</p>
          </div>
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

