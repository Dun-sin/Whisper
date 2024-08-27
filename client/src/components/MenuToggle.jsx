import React from 'react';
import { IconButton, Icon } from 'your-ui-library';
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

export default MenuToggle;
