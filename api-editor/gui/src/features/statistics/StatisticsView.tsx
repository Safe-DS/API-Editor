import React from 'react';

import { PythonPackage } from '../packageData/model/PythonPackage';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { Box, Flex, Heading, VStack } from '@chakra-ui/react';
import { useAppSelector } from '../../app/hooks';
import { selectRawPythonPackage } from '../packageData/apiSlice';
import { selectUsages } from '../usages/usageSlice';
import { createBarChart, createLineChart } from './ChartWrappers';
import { AnnotationStatistics } from './AnnotationStatistics';

export const StatisticsView: React.FC = function () {
    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const usages = useAppSelector(selectUsages);

    const usedThreshold = 1;

    const classLabels = ['full', 'public', 'used'];
    const classValues = getClassValues(rawPythonPackage, usages, usedThreshold);
    const classBarChart = createBarChart(classLabels, classValues, 'Classes');

    const functionLabels = ['full', 'public', 'used'];
    const functionValues = getFunctionValues(rawPythonPackage, usages, usedThreshold);
    const functionBarChart = createBarChart(functionLabels, functionValues, 'Functions');

    const parameterLabels = ['full', 'public', 'used', 'useful'];
    const parameterValues = getParameterValues(rawPythonPackage, usages, usedThreshold);
    const parameterBarChart = createBarChart(parameterLabels, parameterValues, 'Parameters');

    const thresholds = [...Array(26).keys()];
    thresholds.shift();
    const classLineChart = createLineChart(
        usages,
        rawPythonPackage,
        thresholds,
        usages.getNumberOfUsedPublicClasses,
        'Classes',
        'Minimum usefulness',
    );
    const functionLineChart = createLineChart(
        usages,
        rawPythonPackage,
        thresholds,
        usages.getNumberOfUsedPublicFunctions,
        'Functions',
        'Minimum usefulness',
    );
    const parameterLineChart = createLineChart(
        usages,
        rawPythonPackage,
        thresholds,
        usages.getNumberOfUsefulPublicParameters,
        'Parameters',
        'Minimum usefulness',
    );

    return (
        <VStack spacing={4}>
            <Heading as="h3" size="md">
                Progress
            </Heading>
            <AnnotationStatistics />
            <Heading as="h3" size="md">
                API Size
            </Heading>
            <Box width="100%">
                <Flex wrap="wrap">
                    <Box minWidth="350px" flex="1 1 33%">
                        {classBarChart}
                    </Box>
                    <Box minWidth="350px" flex="1 1 33%">
                        {functionBarChart}
                    </Box>
                    <Box minWidth="350px" flex="1 33%">
                        {parameterBarChart}
                    </Box>
                </Flex>
            </Box>
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
        </VStack>
    );
};

export const getClassValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const classes = pythonPackage.getClasses();
    const publicClasses = classes.filter((it) => it.isPublic);

    return [classes.length, publicClasses.length, usages.getNumberOfUsedPublicClasses(pythonPackage, usedThreshold)];
};

export const getFunctionValues = function (
    pythonPackage: PythonPackage,
    usages: UsageCountStore,
    usedThreshold: number,
) {
    const functions = pythonPackage.getFunctions();
    const publicFunctions = functions.filter((it) => it.isPublic);

    return [
        functions.length,
        publicFunctions.length,
        usages.getNumberOfUsedPublicFunctions(pythonPackage, usedThreshold),
    ];
};

export const getParameterValues = function (
    pythonPackage: PythonPackage,
    usages: UsageCountStore,
    usedThreshold: number,
) {
    const parameters = pythonPackage.getParameters();
    const publicParameters = parameters.filter((it) => it.isPublic);

    return [
        parameters.length,
        publicParameters.length,
        usages.getUsedPublicParameters(pythonPackage, usedThreshold).length,
        usages.getNumberOfUsefulPublicParameters(pythonPackage, usedThreshold),
    ];
};
