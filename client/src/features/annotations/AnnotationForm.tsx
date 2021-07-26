import { Button, Heading, HStack, Stack } from '@chakra-ui/react'
import React from 'react'

interface AnnotationFormProps {
    heading: string
    onSave: React.MouseEventHandler<HTMLButtonElement>
    onCancel: React.MouseEventHandler<HTMLButtonElement>
}

const AnnotationForm: React.FC<AnnotationFormProps> = ({ heading, onCancel, onSave, children }) => {
    return (
        <Stack spacing={1}>
            <Heading as="h3" size="lg" p={4}>
                {heading}
            </Heading>

            <Stack spacing={4} p={4}>
                {children}
            </Stack>

            <HStack p={4}>
                <Button colorScheme="blue" onClick={onSave}>
                    Save
                </Button>
                <Button colorScheme="red" onClick={onCancel}>
                    Cancel
                </Button>
            </HStack>
        </Stack>
    )
}

export default AnnotationForm
