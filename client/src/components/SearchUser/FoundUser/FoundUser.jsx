import React from 'react'

import { BiDotsVerticalRounded } from 'react-icons/bi'

const FoundUser = () => {
  return (
    <div className={`bg-[#011627] min-w-[90%] text-[#FFF]`}>
      <div className="foundHeader flex justify-between border-b-[2px] border-[#162938] pt-[50px] pr-[60px] pl-[60px] pb-[10px]">
        <p className='text-[22px] font-semibold'>Anonymous User</p>
        <BiDotsVerticalRounded className='fill-[#f5f5f5] scale-[1.8]' />
      </div>
      <div className="foundChat"></div>
    </div>
  )
}

export default FoundUser
