import { MdAddReaction } from 'react-icons/md';
import PropTypes from 'prop-types';
import React from 'react';

const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

const MessageReactions = ({
	reactions = [],
	userId,
	isSender,
	isPickerOpen,
	onTogglePicker,
	onReact,
}) => {
	const reactionCounts = reactions.reduce((counts, item) => {
		counts[item.reaction] = (counts[item.reaction] || 0) + 1;
		return counts;
	}, {});

	const handleReaction = (reaction) => {
		onTogglePicker();
		onReact(reaction);
	};

	return (
		<div className="relative mt-1 flex min-h-9 items-center gap-1 rounded-full bg-secondary px-1.5 py-1 shadow-md">
			{Object.entries(reactionCounts).map(([reaction, count]) => {
				const isActive = reactions.some(
					(item) => item.userId === userId && item.reaction === reaction
				);

				return (
					<button
						key={reaction}
						type="button"
						className={`rounded-full border px-1.5 py-0.5 text-sm ${
							isActive ? 'border-[#FF9F1C] bg-[#FF9F1C]/25' : 'border-white/30'
						}`}
						onClick={() => handleReaction(reaction)}
						aria-label={`React with ${reaction}`}
					>
						{reaction} {count}
					</button>
				);
			})}
			<button
				type="button"
				className="flex items-center justify-center rounded-full border-2 border-[#FF9F1C] bg-[#FF9F1C] p-1.5 text-lg text-primary shadow-sm transition hover:bg-[#ffb347]"
				onClick={onTogglePicker}
				aria-label="Add reaction"
				aria-expanded={isPickerOpen}
				title="Add reaction"
			>
				<MdAddReaction />
			</button>
			{isPickerOpen && (
				<div
					className={`absolute bottom-full z-30 mb-2 flex gap-1 rounded-full bg-highlight px-2 py-1 shadow-lg ${
						isSender ? 'right-0' : 'left-0'
					}`}
				>
					{REACTIONS.map((reaction) => (
						<button
							key={reaction}
							type="button"
							className="rounded-full p-1 text-lg hover:bg-white/20"
							onClick={() => handleReaction(reaction)}
							aria-label={`React with ${reaction}`}
						>
							{reaction}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

MessageReactions.propTypes = {
	reactions: PropTypes.arrayOf(
		PropTypes.shape({
			reaction: PropTypes.string.isRequired,
			userId: PropTypes.string.isRequired,
		})
	),
	userId: PropTypes.string.isRequired,
	isSender: PropTypes.bool.isRequired,
	isPickerOpen: PropTypes.bool.isRequired,
	onTogglePicker: PropTypes.func.isRequired,
	onReact: PropTypes.func.isRequired,
};

export default MessageReactions;
