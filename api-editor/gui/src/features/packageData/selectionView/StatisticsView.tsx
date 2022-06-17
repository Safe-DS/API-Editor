import React, {ReactElement} from 'react';
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
import {Bar, Line} from 'react-chartjs-2';
import {PythonPackage} from '../model/PythonPackage';
import {UsageCountStore} from '../../usages/model/UsageCountStore';
import {Box, Flex, Button, Heading, VStack, Wrap, WrapItem} from '@chakra-ui/react';
import {selectAnnotations} from '../../annotations/annotationSlice';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import {selectFilterString, setFilterString} from '../../ui/uiSlice';

ChartJS.register(CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip);

interface FunctionViewProps {
    pythonPackage: PythonPackage;
    usages: UsageCountStore;
}

export const StatisticsView: React.FC<FunctionViewProps> = function ({pythonPackage, usages}) {

    const annotations = useAppSelector(selectAnnotations);
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
    const classValues = getClassValues(pythonPackage, usages, usedThreshold);
    const classBarChart = createBarChart(classLabels, classValues, 'Classes');

    const functionLabels = ['full', 'public', 'used'];
    const functionValues = getFunctionValues(pythonPackage, usages, usedThreshold);
    const functionBarChart = createBarChart(functionLabels, functionValues, 'Functions');

    const parameterLabels = ['full', 'public', 'used', 'useful'];
    const parameterValues = getParameterValues(pythonPackage, usages, usedThreshold);
    const parameterBarChart = createBarChart(parameterLabels, parameterValues, 'Parameters');

    const thresholds = [...Array(26).keys()];
    thresholds.shift();
    const classLineChart = createLineChart(
        usages,
        pythonPackage,
        thresholds,
        usages.getNumberOfUsedPublicClasses,
        'Classes per Threshold',
    );
    const functionLineChart = createLineChart(
        usages,
        pythonPackage,
        thresholds,
        usages.getNumberOfUsedPublicFunctions,
        'Functions per Threshold',
    );
    const parameterLineChart = createLineChart(
        usages,
        pythonPackage,
        thresholds,
        usages.getNumberOfUsefulPublicParameters,
        'Parameters per Threshold',
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
        <VStack spacing='4'>
            <Heading as="h2" size="md">
                Statistics
            </Heading>
            <Box width='100%'>
                <Flex wrap='wrap'>
                    <Box minWidth='350px' flex='1 1 33%'>
                        {classBarChart}
                    </Box>
                    <Box minWidth='350px' flex='1 1 33%'>
                        {functionBarChart}
                    </Box>
                    <Box minWidth='350px' flex='1 33%'>
                        {parameterBarChart}
                    </Box>
                </Flex>
            </Box>
            <Box width='100%'>
                <Flex wrap='wrap'>
                    <Box minWidth='350px' flex='1 1 33%'>
                        {classLineChart}
                    </Box>
                    <Box minWidth='350px' flex='1 1 33%'>
                        {functionLineChart}
                    </Box>
                    <Box minWidth='350px' flex='1 1 33%'>
                        {parameterLineChart}
                    </Box>
                </Flex>
            </Box>
            <Heading as="h3" size="md">
                Annotations
            </Heading>
            <Wrap mx="auto" padding="10px 10px 10px 10px">
                <WrapItem>
                    <Button
                        onClick={() => filterAction('attribute')}
                        children={'Attributes: ' + attributesSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('boundary')}
                        children={'Boundaries: ' + boundariesSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('calledAfter')}
                        children={'CalledAfter: ' + calledAftersSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('constant')}
                            children={'Constants: ' + constantsSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('description')}
                        children={'Descriptions: ' + descriptionSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('enum')}
                        children={'Enums: ' + enumsSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('group')}
                        children={'Groups: ' + groupsSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('move')}
                        children={'Move: ' + movesSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('optional')}
                        children={'Optionals: ' + optionalsSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('pure')}
                        children={'Pures: ' + puresSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('remove')}
                        children={'Removes: ' + removesSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('rename')}
                        children={'Renaming: ' + renamingsSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('required')}
                        children={'Requireds: ' + requiredsSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('todo')}
                        children={'Todos: ' + todoSize}
                    ></Button>
                </WrapItem>
            </Wrap>
        </VStack>
    )
};

export let getClassValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const classes = pythonPackage.getClasses();
    let result: number[] = [];

    let publicClasses = 0;
    classes.forEach((element) => {
        publicClasses += element.isPublic ? 1 : 0;
    });

    result.push(classes.length);
    result.push(publicClasses);
    result.push(usages.getNumberOfUsedPublicClasses(pythonPackage, usedThreshold));

    return result;
};

export let getFunctionValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const functions = pythonPackage.getFunctions();
    let result: number[] = [];

    let publicFunctions = 0;
    functions.forEach((element) => {
        publicFunctions += element.isPublic ? 1 : 0;
    });

    result.push(functions.length);
    result.push(publicFunctions);
    result.push(usages.getNumberOfUsedPublicFunctions(pythonPackage, usedThreshold));

    return result;
};

export let getParameterValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const parameters = pythonPackage.getParameters();
    let result: number[] = [];

    let publicParameters = 0;
    parameters.forEach((element) => {
        publicParameters += element.isPublic ? 1 : 0;
    });

    result.push(parameters.length);
    result.push(publicParameters);
    result.push(usages.getUsedPublicParameters(pythonPackage, usedThreshold).length);
    result.push(usages.getNumberOfUsefulPublicParameters(pythonPackage, usedThreshold));

    return result;
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
    let count = 0;
    for (const label of labels) {
        dataValues.set(label, values[count]);
        count++;
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

    return <Bar options={options} data={data}/>;
};

let createLineChart = function (
    usages: UsageCountStore,
    pythonPackage: PythonPackage,
    labels: number[],
    getValue: Function,
    title: string,
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
            },
        ],
    };

    return <Line options={options} data={data}/>;
};
