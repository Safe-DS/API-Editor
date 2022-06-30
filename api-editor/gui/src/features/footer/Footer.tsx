import { HStack, Spacer } from '@chakra-ui/react';
import React from 'react';
import { UsernameInput } from './UsernameInput';
import { FilterControls } from '../filter/FilterControls';

export const Footer: React.FC = function () {
    return (
        <HStack borderTop={1} layerStyle="subtleBorder" padding="0.5em 1em" marginTop={0} w="100%">
            <HStack>
                <FilterControls />
            </HStack>

            <Spacer />

            <HStack>
                <UsernameInput />
            </HStack>
        </HStack>
    );
};
