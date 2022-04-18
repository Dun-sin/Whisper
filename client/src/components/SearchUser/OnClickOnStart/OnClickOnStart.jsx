import React from 'react'
import { useState } from 'react'
import FoundUser from '../FoundUser/FoundUser';

const OnClickOnStart = () => {
  const [isFound, setIsFound] = useState(true);

  return (
    isFound ? <FoundUser /> : <div>Searching.....</div>
  )
}

export default OnClickOnStart;