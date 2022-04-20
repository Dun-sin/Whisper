import React from 'react'

import { BiDotsVerticalRounded } from 'react-icons/bi'
import Chat from '../../Chat/Chat'

const centerItems = `flex items-center justify-center`

const FoundUser = () => {
  return (
    <div className={`bg-[#011627] min-w-[calc(100%-120px)] text-[#FFF]`}>
      <div className="flex justify-between border-b-[2px] border-secondary pt-[50px] pr-[60px] pl-[60px] pb-[10px] h-[12%]">
        <p className='text-[22px] font-semibold'>Anonymous User</p>
        <BiDotsVerticalRounded className='fill-[#f5f5f5] scale-[1.8]' />
      </div>
      <div className={`flex-col h-[88%] ${centerItems}`}>
        <div className={`w-[90%] ${centerItems} flex-col mt-auto`}>
          <p className='text-[16px] font-semibold mb-[20px]'>Connected with a random User, Send hi</p>
          <Chat />
        </div>
      </div>
    </div>
  )
}

export default FoundUser
