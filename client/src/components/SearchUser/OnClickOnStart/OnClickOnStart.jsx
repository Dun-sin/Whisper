import React, { useState, useContext, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { SocketContext } from '../../../Context';


import FoundUser from '../FoundUser/FoundUser';

const OnClickOnStart = () => {
  const [isFound, setIsFound] = useState(false);
  const socket = useContext(SocketContext)

  const userID = useSelector(state => state.ID)

  useEffect(() => {
    socket.connected && socket.emit('adding', ({ userID }))
  }, [socket, userID])

  return (
    isFound ? <FoundUser /> : <div>Searching.....</div>
  )
}

export default OnClickOnStart;