import { Box, Heading, HStack, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { isEmptyList } from '../../../common/util/listOperations';
import { AnnotationDropdown } from '../../annotations/AnnotationDropdown';
import { AnnotationView } from '../../annotations/AnnotationView';
import { PythonFunction } from '../model/PythonFunction';
import { PythonModule } from '../model/PythonModule';
import { DocumentationText } from './DocumentationText';
import { ParameterNode } from './ParameterNode';
import { useAppSelector } from '../../../app/hooks';
import { selectCalledAfters } from '../../annotations/annotationSlice';
import {DoneButton} from "../../annotations/DoneButton";

interface FunctionViewProps {
    pythonFunction: PythonFunction;
}

export const FunctionView: React.FC<FunctionViewProps> = function ({ pythonFunction }) {
    const id = pythonFunction.pathAsString();

    // If more @calledAfter annotations can be added
    const currentCalledAfters = Object.keys(useAppSelector(selectCalledAfters(id)));
    const hasRemainingCalledAfters = pythonFunction
        .siblingFunctions()
        .some((it) => !currentCalledAfters.includes(it.name));

    return (
        <Stack spacing={8}>
            <Stack spacing={4}>
                <HStack>
                    <Heading as="h3" size="lg">
                        {pythonFunction.name} {!pythonFunction.isPublic && '(private)'}
                    </Heading>
                    {pythonFunction.isPublic && (
                        <>
                            <AnnotationDropdown
                                target={id}
                                showCalledAfter={hasRemainingCalledAfters}
                                showDescription
                                showGroup={pythonFunction.explicitParameters().length >= 2}
                                showMove={pythonFunction.containingModuleOrClass instanceof PythonModule}
                                showPure
                                showRemove
                                showRename
                                showTodo
                            />
                            <DoneButton target={id} />
                        </>
                    )}
                </HStack>

                <AnnotationView target={id} />

                <Box paddingLeft={4}>
                    {pythonFunction.description ? (
                        <DocumentationText inputText={pythonFunction.description} />
                    ) : (
                        <ChakraText color="gray.500">There is no documentation for this function.</ChakraText>
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
                            <ParameterNode key={parameters.name} pythonParameter={parameters} isTitle={false} />
                        ))
                    ) : (
                        <ChakraText paddingLeft={4} color="gray.500">
                            There are no parameters.
                        </ChakraText>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};
