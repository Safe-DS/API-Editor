import { Button, Heading, HStack, Stack, Text as ChakraText, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { useKeyboardShortcut } from '../../../app/hooks';

interface AnnotationFormProps {
    heading: string;
    description: string;
    onSave: () => void;
    onCancel: () => void;
    children: React.ReactNode;
}

export const AnnotationForm: React.FC<AnnotationFormProps> = function ({
    heading,
    description,
    onCancel,
    onSave,
    children,
}) {
    useKeyboardShortcut(false, true, false, "Enter", onSave)
    useKeyboardShortcut(false, false, false, "Escape", onCancel)

    return (
        <Stack spacing={8} p={4}>
            <Stack spacing={4}>
                <Heading as="h3" size="lg">
                    {heading}
                </Heading>

                <ChakraText fontStyle="italic">{description}</ChakraText>
            </Stack>

            <Stack spacing={4}>{children}</Stack>

            <HStack>
                <Tooltip label="Confirm the change. (Ctrl+Enter)">
                    <Button colorScheme="blue" onClick={onSave}>
                        Save
                    </Button>
                </Tooltip>
                <Tooltip label="Drop the change. (Esc)">
                    <Button colorScheme="red" onClick={onCancel}>
                        Cancel
                    </Button>
                </Tooltip>
            </HStack>
        </Stack>
    );
};
