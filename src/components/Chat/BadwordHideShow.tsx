import React from 'react';
import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json';
import { BadwordHideShowProps } from '@/types/propstypes';

const BadwordHideShow = ({
    id,
    message,
    md,
    badwordChoices
}: BadwordHideShowProps) => {
    const badwords = new BadWordsNext({ data: en });

    return (<>{typeof message === 'string' ? (
        <span
            dangerouslySetInnerHTML={{
                __html: md.render(
                    badwordChoices[id] === 'hide'
                        ? badwords.filter(message)
                        : badwordChoices[id] === 'show'
                            ? message
                            : message
                ),
            }}
        />
    ) : badwordChoices[id] === 'hide' ? (
        badwords.filter(message)
    ) : badwordChoices[id] === 'show' ? (
        message
    ) : (
        message
    )}</>)
};

export default BadwordHideShow;
