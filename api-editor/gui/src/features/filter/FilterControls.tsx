import { FilterInput } from './FilterInput';
import { FilterHelpButton } from './FilterHelpButton';
import React from 'react';
import { HStack } from '@chakra-ui/react';
import { MatchCount } from './FilterMatchCount';
import { FilterPersistence } from './FilterPersistence';

export const FilterControls = function () {
    return (
        <HStack>
            <FilterPersistence />
            <MatchCount />
            <FilterInput />
            <FilterHelpButton />
        </HStack>
    );
};
