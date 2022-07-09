import { FilterInput } from './FilterInput';
import { FilterHelpButton } from './FilterHelpButton';
import React, { useEffect } from 'react';
import { HStack } from '@chakra-ui/react';
import { MatchCount } from './FilterMatchCount';
import { FilterPersistence } from './FilterPersistence';
import { useAppSelector } from '../../app/hooks';
import { selectFilterString } from '../ui/uiSlice';
import { isValidFilterToken } from './model/filterFactory';

export const FilterControls = function () {
    const filterString = useAppSelector(selectFilterString);
    const [localFilterString, setLocalFilterString] = React.useState(filterString);
    const invalidTokens = localFilterString.split(' ').filter((token) => token !== '' && !isValidFilterToken(token));

    // The filter can be changed via other means as well and the local filter needs to reflect this
    useEffect(() => {
        setLocalFilterString(filterString);
    }, [filterString]);

    return (
        <HStack>
            <FilterPersistence localFilterString={localFilterString} invalidTokens={invalidTokens} />
            <FilterInput
                localFilterString={localFilterString}
                setLocalFilterString={setLocalFilterString}
                invalidTokens={invalidTokens}
            />
            <FilterHelpButton />
            <MatchCount />
        </HStack>
    );
};
