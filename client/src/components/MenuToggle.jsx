// Rsuite
import { IconButton } from 'rsuite';
import { Icon } from '@rsuite/icons';

// Icons
import { BiDotsVerticalRounded } from 'react-icons/bi';
import React from 'react'

const MenuToggle = (props, ref) => {
		return (
			<IconButton
				{...props}
				ref={ref}
				icon={<Icon as={BiDotsVerticalRounded} />}
				appearance="subtle"
				circle
			/>
		);
	};

export default MenuToggle