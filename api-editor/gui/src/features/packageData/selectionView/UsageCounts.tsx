import { Box, Heading, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { PythonParameter } from '../model/PythonParameter';
import { useAppSelector } from '../../../app/hooks';
import { selectUsages } from '../../usages/usageSlice';
import {PythonModule} from "../model/PythonModule";
import {PythonClass} from "../model/PythonClass";
import {PythonFunction} from "../model/PythonFunction";

interface NonParameterUsageCountsProps {
    declaration: PythonModule | PythonClass | PythonFunction;
}

export const NonParameterUsageCounts: React.FC<NonParameterUsageCountsProps> = function ({ declaration }) {
    const usageStore = useAppSelector(selectUsages);
    const nUsages = usageStore.getUsageCount(declaration);

    return (
        <Stack spacing={4}>
            <Heading as="h4" size="md">
                Usages
            </Heading>

            <Stack>
                <ChakraText paddingLeft={4}>
                    {nUsages}
                </ChakraText>
            </Stack>
        </Stack>
    );
};

interface ParameterUsageCountsProps {
    parameter: PythonParameter;
}

export const ParameterUsageCounts: React.FC<ParameterUsageCountsProps> = function ({ parameter }) {
    const usageStore = useAppSelector(selectUsages);

    const nExplicitUsages = usageStore.getUsageCount(parameter);
    const nImplicitUsages = usageStore.getNumberOfImplicitUsagesOfDefaultValue(parameter);

    return (
        <Stack spacing={4}>
            <Heading as="h4" size="md">
                Usages
            </Heading>

            <Stack>
                <ChakraText paddingLeft={4}>
                    <Box as="span" fontWeight="bold">
                        Total:
                    </Box>{' '}
                    {nExplicitUsages + nImplicitUsages}
                </ChakraText>
                {parameter.isOptional() && (
                    <ChakraText paddingLeft={4}>
                        <Box as="span" fontWeight="bold">
                            Explicit:
                        </Box>{' '}
                        {nExplicitUsages}
                    </ChakraText>
                )}
                {parameter.isOptional() && (
                    <ChakraText paddingLeft={4}>
                        <Box as="span" fontWeight="bold">
                            Implicit usages of default value:
                        </Box>{' '}
                        {nImplicitUsages}
                    </ChakraText>
                )}
            </Stack>
        </Stack>
    );
};
