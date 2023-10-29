import { HiUserCircle, HiPencil } from 'react-icons/hi';
import PropTypes from 'prop-types';


export default function UserAvatar({imageUrl, onUploadClick, onEditClick }) {
  return (
    <div className="relative group">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Profile Image"
            className="h-20 w-20 rounded-full"
          />
          <div className="absolute top-0 -right-5 opacity-0 group-hover:opacity-100 flex items-center space-x-2">
            <HiPencil
              className="text-blue-500 h-6 w-6 cursor-pointer"
              onClick={onEditClick}
            />
            {/* <HiTrash
              className="text-red-500 h-6 w-6 cursor-pointer"
              onClick={imageUrl.onDeleteClick}
            /> */}
          </div>
        </>
      ) : (
        <HiUserCircle
          className="text-highlight h-20 w-20 cursor-pointer"
          onClick={onUploadClick}
          title='upload profile image'
        />
      )}
    </div>
  )
};

UserAvatar.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onUploadClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};
