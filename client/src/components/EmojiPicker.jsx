import { default as ReactEmojiPicker } from 'emoji-picker-react';
import { useState } from 'react';
import { MdOutlineEmojiEmotions } from 'react-icons/md';
import { useDarkMode } from 'src/context/DarkModeContext';
import PropTypes from 'prop-types';

export default function EmojiPicker({ onEmojiPick, focusInput }) {
	const { darkMode } = useDarkMode();
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
							theme={darkMode ? 'dark' : 'light'}
							onEmojiClick={hndleEmojiClick}
							lazyLoadEmojis
							skinTonesDisabled
							searchDisabled
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
