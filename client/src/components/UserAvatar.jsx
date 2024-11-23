import { HiPencil, HiUserAdd } from 'react-icons/hi';

import PropTypes from 'prop-types';

export default function UserAvatar({ imageRef, onUploadClick, onEditClick }) {
	return (
		<div className="relative group">
			{imageRef?.current.src ? (
				<>
					<img
						src={imageRef.current.src}
						ref={imageRef}
						alt="Profile Image"
						className="h-20 w-20 rounded-full"
					/>
					<button
						className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 flex items-center bg-highlight p-2 rounded-full cursor-pointer"
						onClick={onEditClick}
					>
						<HiPencil className="h-3 w-3 text-light" />
					</button>
				</>
			) : (
				<HiUserAdd
					className="bg-highlight text-light rounded-full p-5 h-20 w-20 cursor-pointer"
					onClick={onUploadClick}
					title="upload profile image"
				/>
			)}
		</div>
	);
}

UserAvatar.propTypes = {
	imageRef: PropTypes.object,
	onUploadClick: PropTypes.func,
	onEditClick: PropTypes.func,
};
