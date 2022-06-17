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
import { Center, Spacer, Wrap, WrapItem } from '@chakra-ui/react';
import { UsageCountStore } from '../../usages/model/UsageCountStore';

ChartJS.register(CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip);

interface FunctionViewProps {
    pythonPackage: PythonPackage;
    usages: UsageCountStore;
}

export const StatisticsView: React.FC<FunctionViewProps> = function ({ pythonPackage, usages }) {
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

    return (
        <Wrap w="100%">
            <WrapItem flex="0 0 100%" flexWrap="wrap">
                <WrapItem w="33%" minWidth="min-content">
                    <Center w="100%">{classBarChart}</Center>
                </WrapItem>
                <Spacer />
                <WrapItem w="33%" minWidth="min-content">
                    <Center w="100%">{functionBarChart}</Center>
                </WrapItem>
                <Spacer />
                <WrapItem w="33%" minWidth="min-content">
                    <Center w="100%">{parameterBarChart}</Center>
                </WrapItem>
            </WrapItem>

            <WrapItem flex="0 0 100%" flexWrap="wrap">
                <WrapItem w="33%" minWidth="min-content">
                    <Center w="100%">{classLineChart}</Center>
                </WrapItem>
                <Spacer />
                <WrapItem w="33%" minWidth="min-content">
                    <Center w="100%">{functionLineChart}</Center>
                </WrapItem>
                <Spacer />
                <WrapItem w="33%" minWidth="min-content">
                    <Center w="100%">{parameterLineChart}</Center>
                </WrapItem>
            </WrapItem>
        </Wrap>
    );
};

let getClassValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
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

let getFunctionValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
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

let getParameterValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
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

    return <Bar options={options} data={data} />;
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

    return <Line options={options} data={data} />;
};
