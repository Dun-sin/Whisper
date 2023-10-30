import { default as ReactEmojiPicker } from 'emoji-picker-react';
import { useState } from 'react';
import { MdOutlineEmojiEmotions } from 'react-icons/md';

import PropTypes from 'prop-types';

import { useApp } from 'src/context/AppContext';

export default function EmojiPicker({ onEmojiPick, focusInput }) {

	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const { app } = useApp();

	const { settings } = app
	const onClosePicker = () => {
		setShowEmojiPicker(false);
		focusInput();
	};

	const hndleEmojiClick = (emojiData) => {
		onEmojiPick((prev) => prev + emojiData.emoji);
		onClosePicker();
	};

	return (
		<>
			<MdOutlineEmojiEmotions
				onClick={() => setShowEmojiPicker(true)}
				className="fill-white mr-5 scale-[1.3] cursor-pointer"
			/>
			{showEmojiPicker && (
				<>
					<div aria-hidden className="fixed inset-0 z-10" onClick={onClosePicker} />
					<div className="absolute bottom-[calc(100%+16px)] right-0 z-20 w-[min(100%,350px)]">
						<ReactEmojiPicker
							width="100%"
							theme={settings.theme ? 'dark' : 'light'}
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

EmojiPicker.propTypes = {
	onEmojiPick: PropTypes.func,
	focusInput: PropTypes.func,
};
