import React from 'react'
import { useState } from 'react'

const OnClickOnStart = () => {
  const [found, setfound] = useState(true);

  return (
    found ? <div>SearchUserChat</div> : <div>Searching.....</div>
  )
}

export default OnClickOnStart;