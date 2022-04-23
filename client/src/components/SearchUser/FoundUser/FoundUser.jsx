import React from 'react'

import { BiDotsVerticalRounded } from 'react-icons/bi'
import Chat from '../../Chat/Chat'

const centerItems = `flex items-center justify-center`

const FoundUser = () => {
  return (
    <div className={`bg-[#011627] min-w-[calc(100%-120px)] ${centerItems} flex-col max-h-[100vh] text-[#FFF]`} >
      <div className="flex justify-between border-b-[2px] border-secondary pt-[50px] pr-[60px] pl-[60px] pb-[15px] h-[13%] w-[100%]">
        <p className='text-[22px] font-semibold'>Anonymous User</p>
        <BiDotsVerticalRounded className='fill-[#f5f5f5] scale-[1.8]' />
      </div>
      <div className={`flex-col w-[90%] h-[87%] ${centerItems} mt-auto`}>
        <Chat />
      </div>
    </div>
  )
}

export default FoundUser
