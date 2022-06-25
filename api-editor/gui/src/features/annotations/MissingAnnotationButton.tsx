import { IconButton } from '@chakra-ui/react';
import React from 'react';
import { FaFlag } from 'react-icons/fa';
import { missingAnnotationURL } from '../reporting/issueURLBuilder';

interface MissingAnnotationButtonProps {
    target: string;
}

export const MissingAnnotationButton: React.FC<MissingAnnotationButtonProps> = function ({ target }) {
    return (
        <IconButton
            icon={<FaFlag />}
            aria-label="Report Missing Annotation"
            size="sm"
            variant="outline"
            colorScheme="orange"
            onClick={() => {
                window.open(missingAnnotationURL(target), '_blank');
            }}
        />
    );
};
