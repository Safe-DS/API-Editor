import { Box, ButtonGroup, Code, IconButton, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { FaTrash, FaWrench } from 'react-icons/fa'

interface AnnotationViewProps {
    type: string
    name: string
    onEdit: () => void
    onDelete: () => void
}

const AnnotationView: React.FC<AnnotationViewProps> = (props) => {
    return (
        <Box bgColor={useColorModeValue('gray.200', 'gray.700')}>
            <Code>{`@${props.type}: ${props.name}`}</Code>
            <ButtonGroup isAttached>
                <IconButton
                    icon={<FaWrench />}
                    aria-label={'Edit annotation'}
                    colorScheme="blue"
                    size="sm"
                    onClick={props.onEdit}
                />
                <IconButton
                    icon={<FaTrash />}
                    aria-label={'Delete annotation'}
                    colorScheme="blue"
                    size="sm"
                    onClick={props.onDelete}
                />
            </ButtonGroup>
        </Box>
    )
}

export default AnnotationView
