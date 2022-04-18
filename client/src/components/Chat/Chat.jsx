import React from 'react'


import { IoSendSharp } from 'react-icons/io5';

const Chat = () => {
  return (
    <div>
      <div className="displayMessgaes">
      </div>
      <form>
        <input type="text" />
        <button>
          <IoSendSharp />
        </button>
      </form>
    </div>
  )
}

export default Chat