import { Heading, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import PythonParameter from '../model/PythonParameter';
import { ParameterNode } from './ParameterNode';

interface ParameterViewProps {
    pythonParameter: PythonParameter;
}

export const ParameterView: React.FC<ParameterViewProps> = function ({ pythonParameter }) {
    return (
        <Stack spacing={8}>
            <ParameterNode isTitle pythonParameter={pythonParameter} />

            {pythonParameter.defaultValue && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Default value
                    </Heading>
                    <ChakraText paddingLeft={4}>{pythonParameter.defaultValue}</ChakraText>
                </Stack>
            )}

            {pythonParameter.typeInDocs && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Type
                    </Heading>
                    <ChakraText paddingLeft={4}>{pythonParameter.typeInDocs}</ChakraText>
                </Stack>
            )}
        </Stack>
    );
};
