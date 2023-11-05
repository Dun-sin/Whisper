import { useState } from 'react';

import { default as ReactEmojiPicker, Theme } from 'emoji-picker-react';
import { Icon } from '@iconify/react';

import { useApp } from '@/context/AppContext';
import { EmojiPickerProps } from '@/types/propstypes';

export default function EmojiPicker({
  onEmojiPick,
  focusInput,
}: EmojiPickerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { app } = useApp();

  const { settings } = app;
  const onClosePicker = () => {
    setShowEmojiPicker(false);
    focusInput();
  };

  const hndleEmojiClick = (emojiData: { emoji: string }) => {
    onEmojiPick(prev => prev + emojiData.emoji);
    onClosePicker();
  };

  const theme: Theme = settings.theme ? ('dark' as Theme) : ('light' as Theme);

  return (
    <>
      <Icon
        icon='ic:outline-emoji-emotions'
        onClick={() => setShowEmojiPicker(true)}
        className='fill-white mr-5 scale-[1.3] cursor-pointer'
      />
      {showEmojiPicker && (
        <>
          <div
            aria-hidden
            className='fixed inset-0 z-10'
            onClick={onClosePicker}
          />
          <div className='absolute bottom-[calc(100%+16px)] right-0 z-20 w-[min(100%,350px)]'>
            <ReactEmojiPicker
              width='100%'
              theme={theme}
              onEmojiClick={hndleEmojiClick}
              lazyLoadEmojis
              skinTonesDisabled
              searchDisabled={false}
            />
          </div>
        </>
      )}
    </>
  );
}
