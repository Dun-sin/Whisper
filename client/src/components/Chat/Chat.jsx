import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client';

import './Chat.css'

import { messageAction } from '../../redux/Actions/messageAction'

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';

const socket = io.connect('http://localhost:4000');

const Chat = () => {
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [senderId, setSenderId] = useState(Math.floor(Math.random() * 100000000))
  const inputRef = useRef('');

  const state = useSelector(state => state);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('receive_message', ({ senderId, message, time }) => {
      dispatch(messageAction(senderId, message, time, 'anon'))
    })
    console.log('render1')
  }, [dispatch])


  useEffect(() => {
    const available = state.messages.length === 0;
    const findId = state.messages.find(item => item.id === senderId);

    const handleMessages = () => {
      findId && setSentMessages(findId.message);
      const receivedMessages = state.messages.find(item => item.id !== senderId);
      receivedMessages && setReceivedMessages(receivedMessages.message)
    }
    !available && handleMessages();
    console.log('render2')
  }, [state.messages, senderId])

  const handleSubmit = e => {
    e.preventDefault()
    const d = new Date();
    const time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    const message = inputRef.current.value;
    if (message === '' || senderId === undefined || senderId === '123456') return
    socket.emit('send_message', { senderId, message, time });
    dispatch(messageAction(senderId, message, time, 'anon'))
    console.log(state.messages)
    inputRef.current.value = '';
  }

  return (
    <div className='w-[100%] h-[90%] pb-[25px]'>
      <p className='text-[0.8em] font-semibold mb-[20px] text-center'>Connected with a random User</p>
      <ScrollToBottom initialScrollBehavior='auto' className="displayMessgaes h-[75%] ">
        {sentMessages.map(({ message, time }, index) => (
          <div key={index} className={`relative mb-[15px] w-[250px] text-primary ml-auto}`}>
            <p className='bg-[#FF9F1C] rounded-[20px] p-[15px] break-all'>{message}</p>
            <p className='text-white ml-[75%] text-[12px]'>{time}</p>
          </div>
        ))}
        {receivedMessages.map(({ message, time }, index) => (
          < div key={index} className={`relative mb-[15px] w-[250px] text-primary }`}>
            <p className='bg-[#FF9F1C] rounded-[20px] p-[15px] break-all'>{message}</p>
            <p className='text-white ml-[75%] text-[12px]'>{time}</p>
          </div>
        ))}
      </ScrollToBottom>
      <form className='flex justify-center items-center mt-[40px]' onSubmit={handleSubmit}>
        <input placeholder='Send a Message.....' className='h-[65px] focus:outline-none rounded-[15px] bg-secondary w-[100%] text-white pl-[22px] pr-[22px] text-[18px]' ref={inputRef} />
        <button type="submit" className='bg-[#FF9F1C] h-[65px] w-[70px] flex justify-center items-center rounded-[10px]'>
          <IoSend className='fill-primary scale-[2]' />
        </button>
      </form>
    </div>
  )
}

export default Chat;

