import {
    IoCheckmarkCircle,
    IoCloseCircleOutline,
    IoRefreshCircle,
} from 'react-icons/io5';
import { ThreeDots } from 'react-loading-icons';
import PropTypes from 'prop-types';

export default function MessageStatus({
    iAmTheSender,
    time,
    status,
    onResend,
}) {
    const handleResend = () => {
        if (onResend) {
            onResend();
        }
    };
    return (
        <div className='flex items-center space-x-1.5 text-secondary dark:text-white'>
            <span>{time}</span>
            {iAmTheSender && (
                <>
                    {status === 'sent' && <IoCheckmarkCircle />}
                    {status === 'failed' && (
                        <>
                            <IoCloseCircleOutline />
                            <button
                                className="cursor-pointer"
                                title="Resend message"
                                onClick={handleResend}
                            >
                                <IoRefreshCircle size={20} />
                            </button>
                        </>
                    )}
                    {status === 'pending' && (
                        <ThreeDots fill="rgb(255 255 255)" width={10} />
                    )}
                </>
            )}
        </div>
    );
}

MessageStatus.propTypes = {
    iAmTheSender: PropTypes.bool,
    time: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    onResend: PropTypes.func,
};
