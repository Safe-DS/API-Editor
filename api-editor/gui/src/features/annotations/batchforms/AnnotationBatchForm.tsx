import { Button, Heading, HStack, Stack, Text as ChakraText, Tooltip } from '@chakra-ui/react';
import React from 'react';
import {useKeyboardShortcut} from "../../../app/hooks";

interface AnnotationFormProps {
    heading: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    children: React.ReactNode;
}

export const AnnotationBatchForm: React.FC<AnnotationFormProps> = function ({
    heading,
    description,
    onCancel,
    onConfirm,
    children,
}) {
    useKeyboardShortcut(false, true, false, "Enter", onConfirm)
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
                <Tooltip label="Preview the elements changed by this batch operation. (Ctrl+Enter)">
                    <Button colorScheme="blue" onClick={onConfirm}>
                        Start Dry Run
                    </Button>
                </Tooltip>
                <Tooltip label="Stop the batch operation. (Esc)">
                    <Button colorScheme="red" onClick={onCancel}>
                        Cancel
                    </Button>
                </Tooltip>
            </HStack>
        </Stack>
    );
};
