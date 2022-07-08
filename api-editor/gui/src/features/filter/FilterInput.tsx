import {
    Box,
    FormControl,
    Input,
    ListItem,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Text as ChakraText,
    UnorderedList,
} from '@chakra-ui/react';
import { closest, distance } from 'fastest-levenshtein';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectFilterString, setFilterString } from '../ui/uiSlice';
import { getFixedFilterNames, isValidFilterToken } from './model/filterFactory';

export const FilterInput: React.FC = function () {
    const dispatch = useAppDispatch();

    const filterString = useAppSelector(selectFilterString);
    const invalidTokens = filterString.split(' ').filter((token) => token !== '' && !isValidFilterToken(token));
    const filterIsValid = invalidTokens.length === 0;

    return (
        <Box zIndex={50}>
            <Popover
                returnFocusOnClose={false}
                isOpen={!filterIsValid}
                placement="bottom"
                closeOnBlur={false}
                autoFocus={false}
            >
                <PopoverTrigger>
                    <FormControl isInvalid={!filterIsValid}>
                        <Input
                            type="text"
                            placeholder="Filter..."
                            value={useAppSelector(selectFilterString)}
                            onChange={(event) => dispatch(setFilterString(event.target.value))}
                            spellCheck={false}
                            minWidth="400px"
                        />
                    </FormControl>
                </PopoverTrigger>
                {!filterIsValid && (
                    <PopoverContent minWidth={462} fontSize="sm" marginRight={2}>
                        <PopoverArrow />
                        <PopoverHeader>Invalid filter tokens</PopoverHeader>
                        <PopoverBody>
                            <UnorderedList spacing={2}>
                                {invalidTokens.map((token) => (
                                    <InvalidFilterToken key={token} token={token} />
                                ))}
                            </UnorderedList>
                        </PopoverBody>
                    </PopoverContent>
                )}
            </Popover>
        </Box>
    );
};

interface InvalidFilterTokenProps {
    token: string;
}

const InvalidFilterToken: React.FC<InvalidFilterTokenProps> = function ({ token }) {
    const dispatch = useAppDispatch();

    const alternatives = getFixedFilterNames();
    const closestAlternative = closest(token.toLowerCase(), alternatives);
    const closestDistance = distance(token.toLowerCase(), closestAlternative);

    const filterString = useAppSelector(selectFilterString);

    const onClick = () => {
        dispatch(setFilterString(filterString.replace(token, closestAlternative)));
    };

    return (
        <ListItem>
            <ChakraText>
                <Box as="span" fontWeight="bold">
                    {token}
                </Box>
                {closestDistance <= 3 && (
                    <>
                        {'. '}
                        Did you mean{' '}
                        <Box as="span" textDecoration="underline" cursor="pointer" onClick={onClick}>
                            {closestAlternative}
                        </Box>
                        ?
                    </>
                )}
            </ChakraText>
        </ListItem>
    );
};
