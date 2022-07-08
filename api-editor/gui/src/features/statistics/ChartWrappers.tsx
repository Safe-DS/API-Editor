import {UsageCountStore} from '../usages/model/UsageCountStore';
import {PythonPackage} from '../packageData/model/PythonPackage';
import React from 'react';
import {Bar, Line} from 'react-chartjs-2';
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
import {useColorModeValue} from '@chakra-ui/react';

ChartJS.register(ArcElement, CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip);

interface CustomBarChartProps {
    labels: string[];
    values: number[];
    title: string;
}

export const CustomBarChart: React.FC<CustomBarChartProps> = function ({labels, values, title}) {
    const gridColor = useColorModeValue('#BBB', '#555');
    const textColor = useColorModeValue('#000', '#FFF');

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
                color: textColor,
            },
            tooltip: {
                interaction: {
                    axis: 'y',
                },
                intersect: false,
            },
        },
        scales: {
            x: {
                grid: {
                    color: gridColor,
                },
                ticks: {
                    color: textColor,
                },
            },
            y: {
                grid: {
                    color: gridColor,
                },
                ticks: {
                    color: textColor,
                },
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
                borderColor: ['rgba(137, 87, 229, 1)'],
                backgroundColor: ['rgba(137, 87, 229, 0.2)'],
            },
        ],
    };

    return <Bar options={options} data={data}/>;
};

interface CustomLineChartProps {
    usages: UsageCountStore;
    pythonPackage: PythonPackage;
    labels: number[];
    getValue: Function;
    title: string;
    xAxisLabel: string;
}

export const CustomLineChart: React.FC<CustomLineChartProps> = function ({
                                                                             usages,
                                                                             pythonPackage,
                                                                             labels,
                                                                             getValue,
                                                                             title,
                                                                             xAxisLabel,
                                                                         }) {
    const gridColor = useColorModeValue('#BBB', '#555');
    const textColor = useColorModeValue('#000', '#FFF');

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false as const,
            },
            title: {
                display: true,
                text: title,
                color: textColor,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: xAxisLabel,
                    color: textColor,
                },
                grid: {
                    color: gridColor,
                },
                ticks: {
                    color: textColor,
                },
            },
            y: {
                grid: {
                    color: gridColor,
                },
                ticks: {
                    color: textColor,
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
                borderColor: 'rgba(137, 87, 229, 1)',
                backgroundColor: 'rgba(137, 87, 229, 0.2)',
            },
        ],
    };

    return <Line options={options} data={data}/>;
};
