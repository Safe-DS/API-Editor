import {
    Box,
    FormControl,
    Input,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
} from '@chakra-ui/react';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { isValidUsername } from '../../common/util/validation';
import {selectUsername, setUsername} from '../annotations/annotationSlice';

export const UsernameInput: React.FC = function () {
    const dispatch = useAppDispatch();

    const username = useAppSelector(selectUsername);
    const usernameIsValid = isValidUsername(username);

    return (
        <Box zIndex={50}>
            <Popover
                returnFocusOnClose={false}
                isOpen={!usernameIsValid}
                placement="bottom"
                closeOnBlur={false}
                autoFocus={false}
            >
                <PopoverTrigger>
                    <FormControl isInvalid={!usernameIsValid}>
                        <Input
                            type="text"
                            placeholder="Username..."
                            value={username}
                            onChange={(event) => dispatch(setUsername(event.target.value))}
                            spellCheck={false}
                            minWidth="400px"
                        />
                    </FormControl>
                </PopoverTrigger>
                {!usernameIsValid && (
                    <PopoverContent minWidth={462} fontSize="sm" marginRight={2}>
                        <PopoverArrow />
                        <PopoverHeader>Invalid username</PopoverHeader>
                        <PopoverBody>
                            In order to annotate you need to provide a valid username. A valid username must not be
                            empty and contain only alphanumeric characters, underscores, and dashes.
                        </PopoverBody>
                    </PopoverContent>
                )}
            </Popover>
        </Box>
    );
};
