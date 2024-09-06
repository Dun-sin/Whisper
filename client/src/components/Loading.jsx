import MoonLoader from 'react-spinners/MoonLoader';
import { PropTypes } from 'prop-types';
import React from 'react';

const Loading = ({ loading }) => {
	return <MoonLoader size={60} color="#FF9F1C" loading={loading} />;
};

export default Loading;

Loading.propTypes = {
	loading: PropTypes.bool,
};
