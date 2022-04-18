import React from 'react'

import { BiDotsVerticalRounded } from 'react-icons/bi'
import Chat from '../../Chat/Chat'

const FoundUser = () => {
  return (
    <div className={`bg-[#011627] min-w-[93%] text-[#FFF]`}>
      <div className="flex justify-between border-b-[2px] border-[#162938] pt-[50px] pr-[60px] pl-[60px] pb-[10px] h-[12%]">
        <p className='text-[22px] font-semibold'>Anonymous User</p>
        <BiDotsVerticalRounded className='fill-[#f5f5f5] scale-[1.8]' />
      </div>
      <div className='flex flex-col items-center justify-center h-[88%]'>
        <p className='text-[16px] font-semibold'>Connected with a random User, Send hi</p>
        <div>
          <Chat />
        </div>
      </div>
    </div>
  )
}

export default FoundUser
