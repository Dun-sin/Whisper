import { ThreeDots } from 'react-loading-icons';

import { Icon } from '@iconify/react';

export default function MessageStatus({
	iAmTheSender,
	time,
	status,
	onResend,
}: {
	iAmTheSender: boolean;
	time: string;
	status: string;
	onResend: () => void;
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
					{status === 'sent' && <Icon icon='eva:checkmark-circle-fill' />}
					{status === 'failed' && (
						<>
							<Icon icon='solar:close-circle-broken' />
							<button
								className='cursor-pointer'
								title='Resend message'
								onClick={handleResend}>
								<Icon icon='solar:refresh-circle-broken' />
							</button>
						</>
					)}
					{status === 'pending' && (
						<ThreeDots fill='rgb(255 255 255)' width={10} />
					)}
				</>
			)}
		</div>
	);
}
