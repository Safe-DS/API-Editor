import { Button, Icon } from '@chakra-ui/react';
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addComplete, removeComplete, selectComplete, selectUsernameIsValid } from './annotationSlice';

interface CompleteButtonProps {
    target: string;
}

export const CompleteButton: React.FC<CompleteButtonProps> = function ({ target }) {
    const dispatch = useAppDispatch();
    const isComplete = useAppSelector(selectComplete(target));
    const isDisabled = !useAppSelector(selectUsernameIsValid);

    if (isComplete) {
        return (
            <Button
                size="sm"
                variant="solid"
                colorScheme="green"
                rightIcon={<Icon as={FaCheck} />}
                disabled={isDisabled}
                onClick={() => dispatch(removeComplete(target))}
            >
                Complete
            </Button>
        );
    } else {
        return (
            <Button size="sm"  variant="outline" disabled={isDisabled} onClick={() => dispatch(addComplete({ target }))}>
                Mark as Complete
            </Button>
        );
    }
};
