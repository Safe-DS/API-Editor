import React, { ReactElement } from 'react';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { PythonPackage } from '../model/PythonPackage';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { Box, Button, Flex, Heading, SimpleGrid, VStack } from '@chakra-ui/react';
import { selectAnnotationStore } from '../../annotations/annotationSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectFilterString, setFilterString } from '../../ui/uiSlice';
import { selectRawPythonPackage } from '../apiSlice';
import { selectUsages } from '../../usages/usageSlice';

ChartJS.register(CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip);

export const StatisticsView: React.FC = function () {
    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const usages = useAppSelector(selectUsages);
    const annotations = useAppSelector(selectAnnotationStore);
    const filterString = useAppSelector(selectFilterString);
    const dispatch = useAppDispatch();

    const boundariesSize = Object.keys(annotations.boundaries).length;
    const constantsSize = Object.keys(annotations.constants).length;
    const descriptionSize = Object.keys(annotations.descriptions).length;
    const enumsSize = Object.keys(annotations.enums).length;
    const optionalsSize = Object.keys(annotations.optionals).length;
    const movesSize = Object.keys(annotations.moves).length;
    const groupsSize = Object.keys(annotations.groups).length;
    const calledAftersSize = Object.keys(annotations.calledAfters).length;
    const attributesSize = Object.keys(annotations.attributes).length;
    const puresSize = Object.keys(annotations.pures).length;
    const renamingsSize = Object.keys(annotations.renamings).length;
    const requiredsSize = Object.keys(annotations.requireds).length;
    const removesSize = Object.keys(annotations.removes).length;
    const todoSize = Object.keys(annotations.todos).length;

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

    const filterAction = (annotation: string) => {
        const annotationFilterPrefix = 'annotation:@';
        const annotationFilterString = annotationFilterPrefix + annotation;

        //Remove existing annotation filter
        const filterList = filterString.split(' ');
        let newFilter = '';
        for (const element of filterList) {
            if (!element.startsWith(annotationFilterPrefix)) {
                newFilter += element;
                newFilter += ' ';
            }
        }

        newFilter += annotationFilterString;
        dispatch(setFilterString(newFilter));
    };

    return (
        <VStack spacing="4">
            <Heading as="h3" size="md">
                Annotations
            </Heading>
            <SimpleGrid columns={2} spacing={4}>
                <Button onClick={() => filterAction('attribute')} children={'Attributes: ' + attributesSize}></Button>
                <Button onClick={() => filterAction('boundary')} children={'Boundaries: ' + boundariesSize}></Button>
                <Button
                    onClick={() => filterAction('calledAfter')}
                    children={'CalledAfter: ' + calledAftersSize}
                ></Button>
                <Button onClick={() => filterAction('constant')} children={'Constants: ' + constantsSize}></Button>
                <Button
                    onClick={() => filterAction('description')}
                    children={'Descriptions: ' + descriptionSize}
                ></Button>
                <Button onClick={() => filterAction('enum')} children={'Enums: ' + enumsSize}></Button>
                <Button onClick={() => filterAction('group')} children={'Groups: ' + groupsSize}></Button>
                <Button onClick={() => filterAction('move')} children={'Move: ' + movesSize}></Button>
                <Button onClick={() => filterAction('optional')} children={'Optionals: ' + optionalsSize}></Button>
                <Button onClick={() => filterAction('pure')} children={'Pures: ' + puresSize}></Button>
                <Button onClick={() => filterAction('remove')} children={'Removes: ' + removesSize}></Button>
                <Button onClick={() => filterAction('rename')} children={'Renaming: ' + renamingsSize}></Button>
                <Button onClick={() => filterAction('required')} children={'Requireds: ' + requiredsSize}></Button>
                <Button onClick={() => filterAction('todo')} children={'Todos: ' + todoSize}></Button>
            </SimpleGrid>
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

export let getClassValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const classes = pythonPackage.getClasses();
    const publicClasses = classes.filter((it) => it.isPublic);

    return [classes.length, publicClasses.length, usages.getNumberOfUsedPublicClasses(pythonPackage, usedThreshold)];
};

export let getFunctionValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const functions = pythonPackage.getFunctions();
    const publicFunctions = functions.filter((it) => it.isPublic);

    return [
        functions.length,
        publicFunctions.length,
        usages.getNumberOfUsedPublicFunctions(pythonPackage, usedThreshold),
    ];
};

export let getParameterValues = function (
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

let createBarChart = function (labels: string[], values: number[], title: string): ReactElement {
    const options = {
        indexAxis: 'y' as const,
        elements: {
            bar: {
                borderWidth: 2,
            },
        },
        responsive: true,
        plugins: {
            legend: {
                display: false as const,
            },
            title: {
                display: true,
                text: title,
            },
        },
    };

    const dataValues = new Map();
    for (let index = 0; index < labels.length; index++) {
        dataValues.set(labels[index], values[index]);
    }

    const data = {
        labels,
        datasets: [
            {
                data: labels.map((key) => dataValues.get(key)),
                borderColor: ['#9A1D1D', '#7768AE', '#FFCC00', '#1BA25A'],
                backgroundColor: ['#9A1D1D', '#7768AE', '#FFCC00', '#1BA25A'],
            },
        ],
    };

    return <Bar options={options} data={data} />;
};

let createLineChart = function (
    usages: UsageCountStore,
    pythonPackage: PythonPackage,
    labels: number[],
    getValue: Function,
    title: string,
    xAxisLabel: string,
): ReactElement {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false as const,
            },
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: xAxisLabel,
                },
            },
        },
    };

    const dataValues = new Map();
    for (const label of labels) {
        dataValues.set(label, getValue.call(usages, pythonPackage, label));
    }

    const data = {
        labels,
        datasets: [
            {
                data: labels.map((key) => dataValues.get(key)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                // xAxisID: 'x'
            },
        ],
    };

    return <Line options={options} data={data} />;
};
