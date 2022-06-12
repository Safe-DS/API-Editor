import { Box, Heading, HStack, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { AnnotationDropdown } from '../../annotations/AnnotationDropdown';
import { AnnotationView } from '../../annotations/AnnotationView';
import { PythonParameter } from '../model/PythonParameter';
import { DocumentationText } from './DocumentationText';

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    isTitle: boolean;
}

export const ParameterNode: React.FC<ParameterNodeProps> = function ({ isTitle, pythonParameter }) {
    const id = pythonParameter.pathAsString();

    const isConstructorParameter = pythonParameter.parent()?.name === '__init__';
    const isExplicitParameter = pythonParameter.isExplicitParameter();

    return (
        <Stack spacing={4}>
            <HStack>
                {isTitle ? (
                    <Heading as="h3" size="lg">
                        {pythonParameter.name} {!pythonParameter.isPublic && '(private)'}
                    </Heading>
                ) : (
                    <Heading as="h4" size="sm">
                        {pythonParameter.name} {!pythonParameter.isPublic && '(private)'}
                    </Heading>
                )}
                {pythonParameter.isPublic && isExplicitParameter && (
                    <AnnotationDropdown
                        target={id}
                        showAttribute={isConstructorParameter}
                        showBoundary
                        showConstant
                        showEnum
                        showOptional
                        showRename
                        showRequired
                    />
                )}
            </HStack>

            <AnnotationView target={id} />

            <Box paddingLeft={4}>
                {pythonParameter.description ? (
                    <DocumentationText inputText={pythonParameter?.description} />
                ) : (
                    <ChakraText color="gray.500">There is no documentation for this parameter.</ChakraText>
                )}
            </Box>
        </Stack>
    );
};
