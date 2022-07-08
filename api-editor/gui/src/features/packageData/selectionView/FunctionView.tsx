import { Box, Heading, HStack, Stack, Text as ChakraText, Wrap } from '@chakra-ui/react';
import React from 'react';
import { isEmptyList } from '../../../common/util/listOperations';
import { AnnotationDropdown } from '../../annotations/AnnotationDropdown';
import { AnnotationView } from '../../annotations/AnnotationView';
import { PythonFunction } from '../model/PythonFunction';
import { PythonModule } from '../model/PythonModule';
import { DocumentationText } from './DocumentationText';
import { ParameterNode } from './ParameterNode';
import { useAppSelector } from '../../../app/hooks';
import { selectAnnotationStore, selectCalledAfterAnnotations } from '../../annotations/annotationSlice';
import { CompleteButton } from '../../annotations/CompleteButton';
import { PythonParameter } from '../model/PythonParameter';
import { selectFilter, selectSorter } from '../../ui/uiSlice';
import { selectUsages } from '../../usages/usageSlice';
import { MissingAnnotationButton } from '../../annotations/MissingAnnotationButton';
import { DataCopyButtons } from '../../annotations/DataCopyButtons';
import {NonParameterUsageCounts} from "./UsageCounts";

interface FunctionViewProps {
    pythonFunction: PythonFunction;
}

export const FunctionView: React.FC<FunctionViewProps> = function ({ pythonFunction }) {
    const id = pythonFunction.id;
    const parameters = useSortedAndFilteredParameters(pythonFunction);

    // Whether more @calledAfter annotations can be added
    const currentCalledAfters = Object.keys(useAppSelector(selectCalledAfterAnnotations(id)));
    const hasRemainingCalledAfters = pythonFunction
        .siblingFunctions()
        .some((it) => !currentCalledAfters.includes(it.name));

    return (
        <Stack spacing={8}>
            <Stack spacing={4}>
                <HStack alignItems="start">
                    <Heading as="h3" size="lg">
                        {pythonFunction.name} {!pythonFunction.isPublic && '(private)'}
                    </Heading>
                    <Wrap>
                        {pythonFunction.isPublic && (
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
                        )}
                        <CompleteButton target={id} />
                        {pythonFunction.isPublic && <MissingAnnotationButton target={id} />}
                        <DataCopyButtons target={id} />
                    </Wrap>
                </HStack>

                <AnnotationView target={id} />

                <Box paddingLeft={4}>
                    {pythonFunction.description ? (
                        <DocumentationText declaration={pythonFunction} inputText={pythonFunction.description} />
                    ) : (
                        <ChakraText color="gray.500">There is no documentation for this function.</ChakraText>
                    )}
                </Box>
            </Stack>

            <Stack spacing={4}>
                <Heading as="h4" size="md">
                    Sorted & Filtered Parameters
                </Heading>
                <Stack spacing={6} paddingLeft={4}>
                    {!isEmptyList(parameters) ? (
                        parameters.map((it) => <ParameterNode key={it.name} pythonParameter={it} isTitle={false} />)
                    ) : (
                        <ChakraText paddingLeft={4} color="gray.500">
                            There are no parameters.
                        </ChakraText>
                    )}
                </Stack>
            </Stack>

            <NonParameterUsageCounts declaration={pythonFunction} />
        </Stack>
    );
};

const useSortedAndFilteredParameters = function (pythonFunction: PythonFunction): PythonParameter[] {
    const parameters = pythonFunction.parameters;
    const annotations = useAppSelector(selectAnnotationStore);
    const usages = useAppSelector(selectUsages);
    const filter = useAppSelector(selectFilter);
    const sorter = useAppSelector(selectSorter);

    return parameters.filter((it) => filter.shouldKeepDeclaration(it, annotations, usages)).sort(sorter);
};
