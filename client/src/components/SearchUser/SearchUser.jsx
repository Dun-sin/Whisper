import React from 'react'

import { RiUserSearchLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

const centerElement = " flex flex-col items-center justify-center";

const SearchUser = () => {
  return (
    <div className={`bg-primary min-w-[calc(100%-120px)] text-[#FFF]` + centerElement}>
      <RiUserSearchLine style={{ transform: "scale(8)" }} className="text-secondary mb-10" />
      <h1 className='text-[2.3em] mt-5'>Search For Someone</h1>
      <Link to="/founduser" className={"font-medium text-black text-[1.5em] bg-[#FF9F1C] w-[8em] h-[2.3em] mt-5 rounded-[30px]" + centerElement}>Start</Link>
    </div>
  )
}

export default SearchUser;
