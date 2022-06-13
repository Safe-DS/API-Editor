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
    UnorderedList,
} from '@chakra-ui/react';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectFilterString, setFilterString } from '../features/ui/uiSlice';
import { isValidFilterToken } from '../features/packageData/model/filters/filterFactory';

export const FilterInput: React.FC = function () {
    const dispatch = useAppDispatch();

    const filterString = useAppSelector(selectFilterString);
    const invalidTokens = filterString.split(' ').filter((token) => token !== '' && !isValidFilterToken(token));
    const filterIsValid = invalidTokens.length === 0;

    return (
        <Box>
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
                                    <ListItem key={token}>{token}</ListItem>
                                ))}
                            </UnorderedList>
                        </PopoverBody>
                    </PopoverContent>
                )}
            </Popover>
        </Box>
    );
};
