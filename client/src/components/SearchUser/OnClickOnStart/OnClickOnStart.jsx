import React from 'react'
import { useState, useContext } from 'react'
import { useSelector } from 'react-redux';


import FoundUser from '../FoundUser/FoundUser';

const OnClickOnStart = () => {
  const [isFound, setIsFound] = useState(false);

  return (
    isFound ? <FoundUser /> : <div>Searching.....</div>
  )
}

export default OnClickOnStart;