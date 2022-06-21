import { UsageCountStore } from '../usages/model/UsageCountStore';
import { PythonPackage } from '../packageData/model/PythonPackage';
import React, { ReactElement } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip);

export const createBarChart = function (labels: string[], values: number[], title: string): ReactElement {
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

export const createLineChart = function (
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
            },
        ],
    };

    return <Line options={options} data={data} />;
};
