import { Button, Icon } from '@chakra-ui/react';
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addComplete, removeComplete, selectComplete } from './annotationSlice';

interface CompleteButtonProps {
    target: string;
}

export const CompleteButton: React.FC<CompleteButtonProps> = function ({ target }) {
    const dispatch = useAppDispatch();
    const isComplete = useAppSelector(selectComplete(target));

    if (isComplete) {
        return (
            <Button
                size="sm"
                variant="solid"
                colorScheme="green"
                rightIcon={<Icon as={FaCheck} />}
                onClick={() => dispatch(removeComplete(target))}
            >
                Complete
            </Button>
        );
    } else {
        return (
            <Button size="sm" variant="outline" onClick={() => dispatch(addComplete({ target }))}>
                Mark as Complete
            </Button>
        );
    }
};
