import React from 'react';
import { createClassesFromArray } from 'src/lib/utils';

const ComingSoon = () => {
    return (
        <div
            className={createClassesFromArray(
                'bg-alice-blue',
                'dark:bg-primary',
                'md:min-w-[calc(100%-120px)]',
                'flex items-center',
                'justify-center',
                'flex-col',
                'md:min-h-screen',
                'min-h-[calc(100vh-70px)]',
                'text-primary',
                'dark:text-white',
                'text-[calc(1.2vh+1.2vh+1.2vmin)]'
            )}
        >
            Feature Coming Soon
        </div>
    );
};

export default ComingSoon;
