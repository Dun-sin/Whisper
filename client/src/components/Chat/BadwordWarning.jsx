import PropTypes from 'prop-types';
import React from 'react';

const BadwordWarning = ({ id, setBadwordChoices, badwordChoices }) => {
	const hideBadword = (id) => {
		setBadwordChoices({ ...badwordChoices, [id]: 'hide' });
	};

	const showBadword = (id) => {
		setBadwordChoices({ ...badwordChoices, [id]: 'show' });
	};

	return (
		<div className="dark:text-white text-black flex flex-col border-red border w-full rounded-r-md p-3">
			<p>Your buddy is trying to send you a bad word</p>
			<div className="flex w-full gap-6">
				<button onClick={() => showBadword(id)} className="text-sm">
					See
				</button>
				<button onClick={() => hideBadword(id)} className="text-red text-sm">
					Hide
				</button>
			</div>
		</div>
	);
};

export default BadwordWarning;

BadwordWarning.propTypes = {
	id: PropTypes.string.isRequired,
	setBadwordChoices: PropTypes.func.isRequired,
	badwordChoices: PropTypes.object.isRequired,
};
