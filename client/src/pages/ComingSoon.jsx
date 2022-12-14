import React from 'react';
import { createClassesFromArray } from 'src/lib/utils';
import useTheme from 'src/hooks/useTheme';

const ComingSoon = () => {
    const context = useTheme();
    const light = context.theme === 'light';
    return (
        <div
            className={createClassesFromArray(
                'bg-primary',
                light && 'bg-white',
                'md:min-w-[calc(100%-120px)]',
                'flex items-center',
                'justify-center',
                'flex-col',
                'md:min-h-screen',
                'min-h-[calc(100vh-70px)]',
                'text-white',
                light && 'text-black',
                'text-[calc(1.2vh+1.2vh+1.2vmin)]'
            )}
        >
            Feature Coming Soon
        </div>
    );
};

export default ComingSoon;
