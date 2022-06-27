import { Box, Heading, HStack, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { AnnotationDropdown } from '../../annotations/AnnotationDropdown';
import { AnnotationView } from '../../annotations/AnnotationView';
import { PythonClass } from '../model/PythonClass';
import { DocumentationText } from './DocumentationText';
import { SectionListViewItem } from './SectionListViewItem';
import { CompleteButton } from '../../annotations/CompleteButton';
import { MissingAnnotationButton } from '../../annotations/MissingAnnotationButton';
import { MinimalDataCopyButtons } from '../../annotations/MinimalDataCopyButtons';

interface ClassViewProps {
    pythonClass: PythonClass;
}

export const ClassView: React.FC<ClassViewProps> = function ({ pythonClass }) {
    const id = pythonClass.id;

    return (
        <Stack spacing={8}>
            <Stack spacing={4}>
                <HStack>
                    <Heading as="h3" size="lg">
                        {pythonClass.name} {!pythonClass.isPublic && '(private)'}
                    </Heading>
                    {pythonClass.isPublic && (
                        <AnnotationDropdown target={id} showDescription showMove showRemove showRename showTodo />
                    )}
                    <CompleteButton target={id} />
                    <MissingAnnotationButton target={id} />
                    <MinimalDataCopyButtons target={id} />
                </HStack>

                <AnnotationView target={id} />

                <Box paddingLeft={4}>
                    {pythonClass.description ? (
                        <DocumentationText declaration={pythonClass} inputText={pythonClass.description} />
                    ) : (
                        <ChakraText color="gray.500">There is no documentation for this class.</ChakraText>
                    )}
                </Box>
            </Stack>
            <SectionListViewItem title="Superclasses" inputElements={pythonClass.superclasses} />
            <SectionListViewItem title="Decorators" inputElements={pythonClass.decorators} />
        </Stack>
    );
};
