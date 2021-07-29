import { Icon, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

interface VisibilityIndicatorProps {
    hasChildren: boolean
    showChildren: boolean
    isSelected?: boolean
}

const VisibilityIndicator: React.FC<VisibilityIndicatorProps> = ({ hasChildren, showChildren, isSelected = false }) => {
    const isClosed = !isSelected && !showChildren
    const closedColor = useColorModeValue('gray.200', 'gray.700')

    return (
        <Icon
            as={showChildren ? FaChevronDown : FaChevronRight}
            color={isClosed ? closedColor : undefined}
            opacity={hasChildren ? 1 : 0}
        />
    )
}

export default VisibilityIndicator
