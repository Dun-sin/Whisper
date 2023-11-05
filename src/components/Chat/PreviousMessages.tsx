import React from 'react';

import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json';
import { Icon } from '@iconify/react';

import decryptMessage from '@/lib/decryptMessage';
import { PreviousMessagesProps } from '@/types/propstypes';

const PreviousMessages = ({
  id,
  isSender,
  isEdited,
  openPreviousEdit,
  openPreviousMessages,
  oldMessages,
}: PreviousMessagesProps) => {
  const badwords = new BadWordsNext({ data: en });
  return (
    <div>
      {isEdited && (
        <div
          className={`cursor-pointer flex items-center gap ${
            isSender ? 'flex-row' : 'flex-row-reverse'
          }`}
          onClick={() => openPreviousEdit(id)}
        >
          <Icon
            icon='fluent-mdl2:edit-solid-12'
            className='fill-white scale-110'
          />
          <Icon icon='formkit:caretdown' className='fill-white scale-75' />
        </div>
      )}
      {isEdited && openPreviousMessages === id && (
        <div
          className={`absolute ${
            isSender ? 'right-10' : 'left-10'
          } top-12 bg-highlight px-4 py-2 gap flex flex-col rounded-md w-[100px] z-40`}
        >
          <p className='text-center font-bold underline text-lg'>Old</p>
          <div className='flex flex-col'>
            {oldMessages !== undefined &&
              Array.isArray(oldMessages) &&
              oldMessages.map((message, index) => {
                const decrypted = decryptMessage(message) as string;
                message = badwords.filter(decrypted);
                return (
                  <span key={index} className='text-base'>
                    {message}
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviousMessages;
