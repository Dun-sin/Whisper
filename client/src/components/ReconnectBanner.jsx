import React from 'react';
import { PiPlugsLight } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function ReconnectBanner({ handleReconnect }) {
	return (
		<div className="flex flex-col w-full justify-center items-center h-full bg-primary">
			<PiPlugsLight className="text-secondary text-8xl" />
			<p className="text-lg text-center text-white">Sorry, it seems you&apos;re not connected</p>
			<div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-[1.5em] mt-4 font-medium items-center">
				<button
					onClick={handleReconnect}
					className={
						'hover:no-underline hover:text-black text-black w-[8em] h-[2.3em] rounded-[30px] bg-[#FF9F1C] flex flex-col items-center justify-center'
					}
				>
					Try again
				</button>
				<Link to="/" className="underline text-white hover:text-white text-lg">
					Return Home
				</Link>
			</div>
		</div>
	);
}

ReconnectBanner.propTypes = {
	handleReconnect: PropTypes.func,
};
