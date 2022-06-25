import { Box, Heading, HStack, Link as ChakraLink, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { AnnotationDropdown } from '../../annotations/AnnotationDropdown';
import { AnnotationView } from '../../annotations/AnnotationView';
import { PythonParameter } from '../model/PythonParameter';
import { DocumentationText } from './DocumentationText';
import { CompleteButton } from '../../annotations/CompleteButton';
import { Link } from 'react-router-dom';
import { MissingAnnotationButton } from '../../annotations/MissingAnnotationButton';

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    isTitle: boolean;
}

export const ParameterNode: React.FC<ParameterNodeProps> = function ({ isTitle, pythonParameter }) {
    const id = pythonParameter.id;

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
                        <ChakraLink as={Link} to={`/${id}`}>
                            {pythonParameter.name} {!pythonParameter.isPublic && '(private)'}
                        </ChakraLink>
                    </Heading>
                )}
                {pythonParameter.isPublic && isExplicitParameter && (
                    <AnnotationDropdown
                        target={id}
                        showAttribute={isConstructorParameter}
                        showBoundary
                        showConstant
                        showDescription
                        showEnum
                        showOptional
                        showRename
                        showRequired
                        showTodo
                    />
                )}
                <CompleteButton target={id} />
                <MissingAnnotationButton target={id} />
            </HStack>

            <AnnotationView target={id} />

            <Box paddingLeft={4}>
                {pythonParameter.description ? (
                    <DocumentationText declaration={pythonParameter} inputText={pythonParameter?.description} />
                ) : (
                    <ChakraText color="gray.500">There is no documentation for this parameter.</ChakraText>
                )}
            </Box>
        </Stack>
    );
};
