import { Heading, Stack, Text } from '@chakra-ui/react';
import React from 'react';
import PythonParameter from '../model/PythonParameter';
import ParameterNode from './ParameterNode';

interface ParameterViewProps {
    pythonParameter: PythonParameter;
}

const ParameterView: React.FC<ParameterViewProps> = function ({
    pythonParameter,
}) {
    return (
        <Stack spacing={8}>
            <ParameterNode isTitle pythonParameter={pythonParameter} />

            {pythonParameter.hasDefault && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Default value
                    </Heading>
                    <Text paddingLeft={4}>{pythonParameter.defaultValue}</Text>
                </Stack>
            )}

            {pythonParameter.type && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Type
                    </Heading>
                    <Text paddingLeft={4}>{pythonParameter.type}</Text>
                </Stack>
            )}
        </Stack>
    );
};

export default ParameterView;
