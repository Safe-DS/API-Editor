import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import AnnotationDropdown from '../../annotations/AnnotationDropdown';
import AnnotationView from '../../annotations/AnnotationView';
import PythonParameter from '../model/PythonParameter';
import DocumentationText from './DocumentationText';

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    isTitle: boolean;
}

const ParameterNode: React.FC<ParameterNodeProps> = function ({
    isTitle,
    pythonParameter,
}) {
    const id = pythonParameter.pathAsString();

    return (
        <Stack spacing={4}>
            <HStack>
                {isTitle ? (
                    <Heading as="h3" size="lg">
                        {pythonParameter.name}
                    </Heading>
                ) : (
                    <Heading as="h4" size="sm">
                        {pythonParameter.name}
                    </Heading>
                )}
                <AnnotationDropdown
                    target={id}
                    showRename
                    showEnum
                    showRequired
                />
            </HStack>

            <AnnotationView target={id} />

            <Box paddingLeft={4}>
                {pythonParameter.description ? (
                    <DocumentationText
                        inputText={pythonParameter?.description}
                    />
                ) : (
                    <Text color="gray.500">
                        There is no documentation for this parameter.
                    </Text>
                )}
            </Box>
        </Stack>
    );
};

export default ParameterNode;
