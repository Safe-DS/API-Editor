import { Icon, useColorModeValue } from '@chakra-ui/react';
import React, { MouseEvent } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface VisibilityIndicatorProps {
    hasChildren: boolean;
    showChildren: boolean;
    isSelected?: boolean;
    onClick: (event: MouseEvent) => void;
}

export const VisibilityIndicator: React.FC<VisibilityIndicatorProps> = function ({
    hasChildren,
    showChildren,
    isSelected = false,
    onClick = () => {},
}) {
    const isClosed = !isSelected && !showChildren;
    const closedColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Icon
            as={showChildren ? FaChevronDown : FaChevronRight}
            color={isClosed ? closedColor : undefined}
            opacity={hasChildren ? 1 : 0}
            onClick={onClick}
        />
    );
};
