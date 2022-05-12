import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client';

import './Chat.css'

import { messageAction } from '../../redux/Actions/messageAction'

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';

const socket = io.connect('http://localhost:4000');

const Chat = () => {
  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [senderId, setSenderId] = useState('123456');
  const [isSender, setIsSender] = useState(false);

  const state = useSelector(state => state);
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected')
      setSenderId(socket.id);
    })
    console.log('render1')
  }, [])

  useEffect(() => {
    socket.on('receive_message', ({ senderId, message, time }) => {
      dispatch(messageAction(senderId, message, time, 'anon'))
    })
  }, [dispatch, state.messages])


  useEffect(() => {
    const available = state.messages.length === 0;
    const findId = state.messages.find(item => item.id === senderId);

    const handleMessages = () => {
      findId.map(item => setSentMessages(item.message));
    }
    !available && handleMessages();
    console.log('render3')
  }, [state.messages, senderId])

  const handleInput = e => {
    setMessage(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const d = new Date();
    const time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    if (message === '' || senderId === undefined || senderId === '123456') return
    socket.emit('send_message', { senderId, message, time });
    dispatch(messageAction(senderId, message, time, 'anon'))
    console.log(state.messages)
    setMessage('')
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
          <div key={index} className={`relative mb-[15px] w-[250px] text-primary ml-auto}`}>
            <p className='bg-[#FF9F1C] rounded-[20px] p-[15px] break-all'>{message}</p>
            <p className='text-white ml-[75%] text-[12px]'>{time}</p>
          </div>
        ))}
      </ScrollToBottom>
      <form className='flex justify-center items-center mt-[40px]' onSubmit={handleSubmit}>
        <input placeholder='Send a Message.....' className='h-[65px] focus:outline-none rounded-[15px] bg-secondary w-[100%] text-white pl-[22px] pr-[22px] text-[18px]' value={message} onChange={handleInput} />
        <button type="submit" className='bg-[#FF9F1C] h-[65px] w-[70px] flex justify-center items-center rounded-[10px]'>
          <IoSend className='fill-primary scale-[2]' />
        </button>
      </form>
    </div>
  )
}

export default Chat;

