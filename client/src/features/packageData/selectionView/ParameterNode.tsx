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

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    const id = props.pythonParameter.pathAsString();

    return (
        <Stack spacing={4}>
            <HStack>
                {props.isTitle ? (
                    <Heading as="h3" size="lg">
                        {props.pythonParameter.name}
                    </Heading>
                ) : (
                    <Heading as="h4" size="sm">
                        {props.pythonParameter.name}
                    </Heading>
                )}
                <AnnotationDropdown target={id} showRename showEnum />
            </HStack>

            <AnnotationView target={id} />

            <Box paddingLeft={4}>
                {props.pythonParameter.description ? (
                    <DocumentationText inputText={props.pythonParameter?.description} />
                ) : (
                    <Text color="gray.500">There is no documentation for this parameter.</Text>
                )}
            </Box>
        </Stack>
    );
}
