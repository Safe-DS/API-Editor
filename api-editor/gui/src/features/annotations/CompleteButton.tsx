import { Button, Icon, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addComplete, removeComplete, selectComplete, selectUsernameIsValid } from './annotationSlice';

interface CompleteButtonProps {
    target: string;
}

export const CompleteButton: React.FC<CompleteButtonProps> = function ({ target }) {
    const dispatch = useAppDispatch();
    const completeAnnotation = useAppSelector(selectComplete(target));
    const isDisabled = !useAppSelector(selectUsernameIsValid);

    const completeButton = (
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

    let completeButtonTooltipLabel = '';
    if ((completeAnnotation?.authors?.length ?? 0) > 0) {
        completeButtonTooltipLabel += `Marked as complete by ${completeAnnotation!.authors![0]}.`;
    }
    if (!isDisabled) {
        completeButtonTooltipLabel += ` Click to undo.`;
    }

    if (completeAnnotation) {
        if (completeButtonTooltipLabel) {
            return (
                <Tooltip label={completeButtonTooltipLabel} shouldWrapChildren mt="3">
                    {completeButton}
                </Tooltip>
            );
        } else {
            // eslint-disable-next-line react/jsx-no-useless-fragment
            return <>{completeButton}</>;
        }
    } else {
        return (
            <Button size="sm" variant="outline" disabled={isDisabled} onClick={() => dispatch(addComplete({ target }))}>
                Mark as Complete
            </Button>
        );
    }
};
