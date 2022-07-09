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

interface FilterInputProps {
    localFilterString: string;
    setLocalFilterString: (newLocalFilterString: string) => void;
}

export const FilterInput: React.FC<FilterInputProps> = function ({localFilterString, setLocalFilterString}) {
    const dispatch = useAppDispatch();

    const invalidTokens = localFilterString.split(' ').filter((token) => token !== '' && !isValidFilterToken(token));
    const filterIsValid = invalidTokens.length === 0;

    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout>();

    const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setLocalFilterString(event.target.value);

        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(undefined);
        }

        const newTimeoutId = setTimeout(() => {
            dispatch(setFilterString(event.target.value));
        }, 1000);

        setTimeoutId(newTimeoutId);
    };

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
                            value={localFilterString}
                            onChange={onChange}
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
