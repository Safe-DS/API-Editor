import { Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import { isEmptyList } from '../../../common/util/listOperations';
import AnnotationDropdown from '../../annotations/AnnotationDropdown';
import AnnotationView from '../../annotations/AnnotationView';
import PythonFunction from '../model/PythonFunction';
import DocumentationText from './DocumentationText';
import ParameterNode from './ParameterNode';

interface FunctionViewProps {
    pythonFunction: PythonFunction;
}

const FunctionView: React.FC<FunctionViewProps> = function ({
    pythonFunction,
}) {
    const id = pythonFunction.pathAsString();

    return (
        <Stack spacing={8}>
            <Stack spacing={4}>
                <HStack>
                    <Heading as="h3" size="lg">
                        {pythonFunction.name}
                    </Heading>
                    <AnnotationDropdown target={id} showRename showUnused />
                </HStack>

                <AnnotationView target={id} />

                <Box paddingLeft={4}>
                    {pythonFunction.description ? (
                        <DocumentationText
                            inputText={pythonFunction.description}
                        />
                    ) : (
                        <Text color="gray.500">
                            There is no documentation for this function.
                        </Text>
                    )}
                </Box>
            </Stack>

            <Stack spacing={4}>
                <Heading as="h4" size="md">
                    Parameters
                </Heading>
                <Stack spacing={6} paddingLeft={4}>
                    {!isEmptyList(pythonFunction.parameters) ? (
                        pythonFunction.parameters.map((parameters) => (
                            <ParameterNode
                                key={parameters.name}
                                pythonParameter={parameters}
                                isTitle={false}
                            />
                        ))
                    ) : (
                        <Text paddingLeft={4} color="gray.500">
                            There are no parameters.
                        </Text>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};

export default FunctionView;
