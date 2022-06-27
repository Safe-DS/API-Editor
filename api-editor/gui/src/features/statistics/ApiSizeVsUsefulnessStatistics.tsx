import React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useAppSelector } from '../../app/hooks';
import { selectRawPythonPackage } from '../packageData/apiSlice';
import { selectUsages } from '../usages/usageSlice';
import { CustomLineChart } from './ChartWrappers';

export const ApiSizeVsUsefulnessStatistics = function () {
    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const usages = useAppSelector(selectUsages);

    const thresholds = [...Array(26).keys()];
    thresholds.shift();
    const classLineChart = (
        <CustomLineChart
            usages={usages}
            pythonPackage={rawPythonPackage}
            labels={thresholds}
            getValue={usages.getNumberOfUsedPublicClasses}
            title={'Classes'}
            xAxisLabel={'Minimum usefulness'}
        />
    );
    const functionLineChart = (
        <CustomLineChart
            usages={usages}
            pythonPackage={rawPythonPackage}
            labels={thresholds}
            getValue={usages.getNumberOfUsedPublicFunctions}
            title={'Functions'}
            xAxisLabel={'Minimum usefulness'}
        />
    );
    const parameterLineChart = (
        <CustomLineChart
            usages={usages}
            pythonPackage={rawPythonPackage}
            labels={thresholds}
            getValue={usages.getNumberOfUsefulPublicParameters}
            title={'Parameters'}
            xAxisLabel={'Minimum usefulness'}
        />
    );

    return (
        <>
            <Heading as="h3" size="md">
                API Size per Minimum Usefulness Threshold
            </Heading>
            <Box width="100%">
                <Flex wrap="wrap">
                    <Box minWidth="350px" flex="1 1 33%">
                        {classLineChart}
                    </Box>
                    <Box minWidth="350px" flex="1 1 33%">
                        {functionLineChart}
                    </Box>
                    <Box minWidth="350px" flex="1 1 33%">
                        {parameterLineChart}
                    </Box>
                </Flex>
            </Box>
        </>
    );
};
