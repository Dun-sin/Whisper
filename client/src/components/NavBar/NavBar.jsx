import React from 'react';
import { NavLink } from 'react-router-dom';
// Icons

import { BsChatDots } from 'react-icons/bs'
import { RiUserSearchLine } from 'react-icons/ri';
import { BiUserCircle } from 'react-icons/bi'

const linkStyle = `h-[80px] w-[90px] flex items-center justify-center hover:bg-[#011627] p-6 rounded-[15px] `;
const activeStyle = linkStyle + "bg-[#011627] shadow-2xl";
const iconStyle = "fill-[#f5f5f5] active:fill-[#ff9f1c] scale-[2]";

const NavBar = () => {
  return (
    <div className='
    navContainer bg-[#162938] 
    w-[7%] min-h-[100vh]
    flex items-center flex-col
    justify-center shadow-[0_0_100px_0_rgba(0,0,0,1)] p-5'>
      <div className="justify-between flex items-center flex-col h-[35%]">
        <NavLink
          to="/searchuser"
          className={({ isActive }) => (isActive ? activeStyle : linkStyle)}
        >
          <RiUserSearchLine className={iconStyle} />
        </NavLink>
        <NavLink to="/friends"
          className={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
          <BsChatDots className={iconStyle} />
        </NavLink>
        <NavLink to="/profile"
          className={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
          <BiUserCircle className={iconStyle} />
        </NavLink>
      </div>
    </div>
  )
}

export default NavBar;