import React from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useAppSelector } from '../../app/hooks';
import { selectRawPythonPackage } from '../packageData/apiSlice';
import { selectUsages } from '../usages/usageSlice';
import { PythonPackage } from '../packageData/model/PythonPackage';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { CustomBarChart } from './ChartWrappers';

export const ApiSizeStatistics = function () {
    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const usages = useAppSelector(selectUsages);

    const usedThreshold = 1;

    const classLabels = ['full', 'public', 'used'];
    const classValues = getClassValues(rawPythonPackage, usages, usedThreshold);
    const classBarChart = <CustomBarChart labels={classLabels} values={classValues} title="Classes" />;

    const functionLabels = ['full', 'public', 'used'];
    const functionValues = getFunctionValues(rawPythonPackage, usages, usedThreshold);
    const functionBarChart = <CustomBarChart labels={functionLabels} values={functionValues} title="Functions" />;

    const parameterLabels = ['full', 'public', 'used', 'useful'];
    const parameterValues = getParameterValues(rawPythonPackage, usages, usedThreshold);
    const parameterBarChart = <CustomBarChart labels={parameterLabels} values={parameterValues} title={'Parameters'} />;

    return (
        <>
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
        </>
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
