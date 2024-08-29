import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@rsuite/icons';
import { IconButton } from 'rsuite';
import { BiDotsVerticalRounded } from 'react-icons/bi';

const MenuToggle = React.forwardRef((props, ref) => {
	return (
		<IconButton
			{...props}
			ref={ref}
			icon={<Icon as={BiDotsVerticalRounded} />}
			appearance="subtle"
			circle
		/>
	);
});
MenuToggle.displayName = 'MenuToggle';
MenuToggle.propTypes = {
	appearance: PropTypes.string,
	circle: PropTypes.bool,
};

export default MenuToggle;
