import { Button, Heading, HStack, Stack } from '@chakra-ui/react';
import React from 'react';

interface AnnotationFormProps {
    heading: string;
    onSave: React.MouseEventHandler<HTMLButtonElement>;
    onCancel: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
}

export const AnnotationForm: React.FC<AnnotationFormProps> = function ({
    heading,
    onCancel,
    onSave,
    children,
}) {
    return (
        <Stack spacing={8} p={4}>
            <Heading as="h3" size="lg">
                {heading}
            </Heading>

            <Stack spacing={4}>{children}</Stack>

            <HStack>
                <Button colorScheme="blue" onClick={onSave}>
                    Save
                </Button>
                <Button colorScheme="red" onClick={onCancel}>
                    Cancel
                </Button>
            </HStack>
        </Stack>
    );
};
