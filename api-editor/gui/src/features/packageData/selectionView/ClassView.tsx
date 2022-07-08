import { Box, Heading, HStack, Stack, Text as ChakraText, Wrap } from '@chakra-ui/react';
import React from 'react';
import { AnnotationDropdown } from '../../annotations/AnnotationDropdown';
import { AnnotationView } from '../../annotations/AnnotationView';
import { PythonClass } from '../model/PythonClass';
import { DocumentationText } from './DocumentationText';
import { SectionListViewItem } from './SectionListViewItem';
import { CompleteButton } from '../../annotations/CompleteButton';
import { MissingAnnotationButton } from '../../annotations/MissingAnnotationButton';
import { DataCopyButtons } from '../../annotations/DataCopyButtons';
import {NonParameterUsageCounts} from "./UsageCounts";

interface ClassViewProps {
    pythonClass: PythonClass;
}

export const ClassView: React.FC<ClassViewProps> = function ({ pythonClass }) {
    const id = pythonClass.id;

    return (
        <Stack spacing={8}>
            <Stack spacing={4}>
                <HStack alignItems="start">
                    <Heading as="h3" size="lg">
                        {pythonClass.name} {!pythonClass.isPublic && '(private)'}
                    </Heading>
                    <Wrap>
                        {pythonClass.isPublic && (
                            <AnnotationDropdown target={id} showDescription showMove showRemove showRename showTodo />
                        )}
                        <CompleteButton target={id} />
                        {pythonClass.isPublic && <MissingAnnotationButton target={id} />}
                        <DataCopyButtons target={id} />
                    </Wrap>
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
            <NonParameterUsageCounts declaration={pythonClass} />
        </Stack>
    );
};
