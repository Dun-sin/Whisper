import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client';

import './Chat.css'

import ScrollToBottom from 'react-scroll-to-bottom';
import { IoSend } from 'react-icons/io5';

import { addMessages } from '../../redux/Reducers/baseSlice';

const socket = io.connect('http://localhost:4000');

const senderId = Math.floor(Math.random() * 100000000)
const Chat = () => {
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef('');

  const state = useSelector(state => state.messages);
  const dispatch = useDispatch();
  dispatch(addMessages({
    id: senderId,
    messages: {
      message: 'hi',
      time: '32323'
    },
    room: 'anon'
  }))

  console.log(state)
  // useEffect(() => {
  //   socket.on('receive_message', ({ senderId, message, time }) => {
  //     dispatch(messageAction(senderId, message, time, 'anon'))
  //   })
  // }, [dispatch])


  // useEffect(() => {
  //   const available = state.messages.length === 0;
  //   const senderMessages = state.messages.find(item => item.id === senderId);
  //   const receiverMessages = state.messages.find(item => item.id !== senderId);

  //   const handleMessages = () => {
  //     senderMessages && setSentMessages(senderMessages.message);
  //     receiverMessages && setReceivedMessages(receiverMessages.message)
  //   }
  //   !available && handleMessages();
  // }, [state.messages])

  // const combine = () => {
  //   const array = [...sentMessages, ...receivedMessages];
  //   // array.map((unit) => console.log(unit))
  //   // console.log(array)
  // }

  // const handleSubmit = e => {
  //   e.preventDefault()
  //   const d = new Date();
  //   const time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
  //   const message = inputRef.current.value;
  //   if (message === '' || senderId === undefined || senderId === '123456') return
  //   socket.emit('send_message', { senderId, message, time });
  //   dispatch(messageAction(senderId, message, time, 'anon'))
  //   inputRef.current.value = '';
  // }

  return (
    <div className='w-[100%] h-[90%] pb-[25px]'>
      <p className='text-[0.8em] font-semibold mb-[20px] text-center'>Connected with a random User</p>
      <ScrollToBottom initialScrollBehavior='auto' className="displayMessgaes h-[75%] w-[100%]">
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
      {/* <form className='flex justify-center items-center mt-[40px]' onSubmit={handleSubmit}>
        <input placeholder='Send a Message.....' className='h-[65px] focus:outline-none rounded-[15px] bg-secondary w-[100%] text-white pl-[22px] pr-[22px] text-[18px]' ref={inputRef} />
        <button type="submit" className='bg-[#FF9F1C] h-[65px] w-[70px] flex justify-center items-center rounded-[10px]'>
          <IoSend className='fill-primary scale-[2]' />
        </button>
      </form> */}
    </div>
  )
}

export default Chat;

