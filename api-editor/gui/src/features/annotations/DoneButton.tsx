import { Button, Icon } from '@chakra-ui/react';
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addDone, removeDone, selectDone } from './annotationSlice';

interface DoneButtonProps {
    target: string;
}

export const DoneButton: React.FC<DoneButtonProps> = function ({ target }) {
    const dispatch = useAppDispatch();
    const isDone = useAppSelector(selectDone(target));

    if (isDone) {
        return (
            <Button
                size="sm"
                variant="solid"
                colorScheme="green"
                rightIcon={<Icon as={FaCheck} />}
                onClick={() => dispatch(removeDone(target))}
            >
                Done
            </Button>
        );
    } else {
        return (
            <Button size="sm" variant="outline" onClick={() => dispatch(addDone({ target }))}>
                Mark as done
            </Button>
        );
    }
};
