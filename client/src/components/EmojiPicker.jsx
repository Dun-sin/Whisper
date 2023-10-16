import {default as ReactEmojiPicker} from 'emoji-picker-react';
import { useState } from 'react';
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { useDarkMode } from 'src/context/DarkModeContext';
import PropTypes from 'prop-types';

export default function EmojiPicker({onEmojiPick}){
    const { darkMode } = useDarkMode();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const hndleEmojiClick = (emoji) => {
        onEmojiPick(prev => prev + emoji.emoji);
        setShowEmojiPicker(false);
    };

  return (
    <>
        <MdOutlineEmojiEmotions
            onClick={()=>setShowEmojiPicker(!showEmojiPicker)}
            className="fill-white mr-5 scale-[1.3] cursor-pointer"
        />
        {showEmojiPicker && <>
            <div 
                aria-hidden
                className='fixed inset-0 z-10'
                onClick={() => setShowEmojiPicker(false)}
            />
            <div
                className='absolute bottom-[calc(100%+16px)] left-0 right-0 z-20 flex justify-end'
            >
                <div className='w-[min(100%,350px)]'>
                    <ReactEmojiPicker
                        width='100%'
                        theme={darkMode ? 'dark' : 'light'}
                        onEmojiClick={hndleEmojiClick}
                        lazyLoadEmojis
                        skinTonesDisabled
                        searchDisabled
                    />
                </div>
            </div>
        </>}
    </>
  )
}

EmojiPicker.propTypes = {
    onEmojiPick: PropTypes.func,
};