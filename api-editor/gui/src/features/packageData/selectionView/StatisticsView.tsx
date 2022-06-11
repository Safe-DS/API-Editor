import React, {ReactElement} from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    PointElement,
    LineElement,
    LinearScale,
    BarElement,
    Title,
    Tooltip
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    PointElement,
    LineElement,
    LinearScale,
    BarElement,
    Title,
    Tooltip
);

import { Bar, Line } from 'react-chartjs-2';
import PythonPackage from "../model/PythonPackage";
import {VStack} from "@chakra-ui/react";
import {UsageCountStore} from "../../usages/model/UsageCountStore";


interface FunctionViewProps {
    pythonPackage: PythonPackage;
    usages: UsageCountStore;
}

const StatisticsView: React.FC<FunctionViewProps> = function ({pythonPackage, usages}) {

    const usedThreshold = 1;

    const classLabels = ['full', 'public', 'used'];
    const classValues = getClassValues(pythonPackage, usages, usedThreshold);
    const classBarChart = createBarChart(classLabels, classValues, "Classes");

    const functionLabels = ['full', 'public', 'used'];
    const functionValues = getFunctionValues(pythonPackage, usages, usedThreshold);
    const functionBarChart = createBarChart(functionLabels, functionValues, "Functions");

    const parameterLabels = ['full', 'public', 'used', 'useful'];
    const parameterValues = getParameterValues(pythonPackage, usages, usedThreshold);
    const parameterBarChart = createBarChart(parameterLabels, parameterValues, "Parameters");


    const thresholds = [...Array(26).keys()];
    thresholds.shift();
    const classLineChart = createLineChart(usages, thresholds, getUsedClasses, "Classes per Threshold");
    const functionLineChart = createLineChart(usages, thresholds, getUsedFunctions, "Classes per Threshold");
    const parameterLineChart = createLineChart(usages, thresholds, getUsefulParameters, "Classes per Threshold");

    return (
        <VStack>
            {classBarChart},
            {functionBarChart},
            {parameterBarChart},
            {classLineChart},
            {functionLineChart},
            {parameterLineChart}
        </VStack>
    )



};

let getClassValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const classes = pythonPackage.getClasses();
    let result: number[] = [];

    let publicClasses = 0;
    classes.forEach((element) => {
        publicClasses += (element.isPublic) ? 1 : 0
    });

    result.push(classes.length);
    result.push(publicClasses);
    result.push(getUsedClasses(usages, usedThreshold));

    return result;
}

let getFunctionValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const functions = pythonPackage.getFunctions();
    let result: number[] = [];

    let publicFunctions = 0;
    functions.forEach((element) => {
        publicFunctions += (element.isPublic) ? 1 : 0
    });

    result.push(functions.length);
    result.push(publicFunctions);
    result.push(getUsedFunctions(usages, usedThreshold));

    return result;
}

let getParameterValues = function (pythonPackage: PythonPackage, usages: UsageCountStore, usedThreshold: number) {
    const parameters = pythonPackage.getParameter();
    let result: number[] = [];

    let publicParameters = 0;
    parameters.forEach((element) => {
        publicParameters += (element.isPublic) ? 1 : 0
    });

    result.push(parameters.length);
    result.push(publicParameters);
    result.push(getUsedParameters(usages, usedThreshold).length);
    result.push(getUsefulParameters(usages, usedThreshold));

    return result;
}

let getUsedClasses = function (usages: UsageCountStore, usedThreshold: number): number {
    let usedClasses = 0;
    usages.classUsages.forEach((value) => {
        usedClasses += (value >= usedThreshold) ? 1 : 0});
    return usedClasses;
}

let getUsedFunctions = function (usages: UsageCountStore, usedThreshold: number): number {
    let usedFunctions = 0;
    usages.functionUsages.forEach((value) => {
        usedFunctions += (value >= usedThreshold) ? 1 : 0});
    return usedFunctions;
}

let getUsedParameters = function (usages: UsageCountStore, usedThreshold: number): string[] {
    let usedParameters: string[] = [];
    usages.parameterUsages.forEach((value, key) => {
        if (value >= usedThreshold) {usedParameters.push(key)}
    });
    return usedParameters;
}

let getUsefulParameters = function (usages: UsageCountStore, usedThreshold: number): number {
    const usedParameters = getUsedParameters(usages, usedThreshold);
    let usefulParameter = 0;
    usedParameters.forEach((name) => { // @ts-ignore
        if (usages.valueUsages.get(name).size > 1) {usefulParameter++}});
    return usefulParameter;
}

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
                borderColor: [
                    "#9A1D1D",
                    "#7768AE",
                    "#FFCC00",
                    "#1BA25A"
                ],
                backgroundColor: [
                    "#9A1D1D",
                    "#7768AE",
                    "#FFCC00",
                    "#1BA25A"
                ],
            }
        ],
    };

    return (
        <Bar options={options} data={data} />
    )
}

let createLineChart = function (usages: UsageCountStore, labels: number[], getValue: Function, title: string): ReactElement {
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
        dataValues.set(label, getValue(usages, label));
    }

    const data = {
        labels,
        datasets: [
            {
                data: labels.map((key) => dataValues.get(key)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ],
    };

    return (
        <Line options={options} data={data} />
    )
}


export default StatisticsView;
