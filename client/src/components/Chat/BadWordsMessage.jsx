
const BadWordsMessage = ({
	id,
	showBadword,
	hideBadword,
}) => {
	return (
		<div className="dark:text-white text-black flex flex-col border-red border w-full rounded-r-md p-3">
			<p>Your buddy is trying to send you a bad word</p>
			<div className="flex w-full gap-6">
				<button
					onClick={() => showBadword(id)}
					className="text-sm cursor-pointer"
				>
					See
				</button>
				<button
					onClick={() => hideBadword(id)}
					className="text-red text-sm cursor-pointer"
				>
					Hide
				</button>	
			</div>
		</div>
	)
}

export default BadWordsMessage;
