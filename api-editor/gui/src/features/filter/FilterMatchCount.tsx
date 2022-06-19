import { useAppSelector } from '../../app/hooks';
import { selectNumberOfMatchedNodes } from '../packageData/apiSlice';
import { Text as ChakraText } from '@chakra-ui/react';
import React from 'react';

export const MatchCount = function () {
    const count = useAppSelector(selectNumberOfMatchedNodes);

    let text;
    if (count === 0) {
        text = 'No matches';
    } else if (count === 1) {
        text = '1 match';
    } else {
        text = `${count} matches`;
    }

    return <ChakraText fontWeight="bold">{text}</ChakraText>;
};
