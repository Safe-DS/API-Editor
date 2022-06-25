import { Box, Heading, Stack, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { PythonParameter } from '../model/PythonParameter';
import { ParameterNode } from './ParameterNode';
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
import { Bar } from 'react-chartjs-2';
import { useAppSelector } from '../../../app/hooks';
import { selectUsages } from '../../usages/usageSlice';

ChartJS.register(CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip);

interface ParameterViewProps {
    pythonParameter: PythonParameter;
}

export const ParameterView: React.FC<ParameterViewProps> = function ({ pythonParameter }) {
    const usages = useAppSelector(selectUsages);
    const parameterUsages = usages.valueUsages.get(pythonParameter.id);

    return (
        <Stack spacing={8}>
            <ParameterNode isTitle pythonParameter={pythonParameter} />

            {pythonParameter.typeInDocs && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Type
                    </Heading>
                    <ChakraText paddingLeft={4}>{pythonParameter.typeInDocs}</ChakraText>
                </Stack>
            )}

            {pythonParameter.defaultValue && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Default Value
                    </Heading>
                    <ChakraText paddingLeft={4}>{pythonParameter.defaultValue}</ChakraText>
                </Stack>
            )}

            {parameterUsages && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Most Common Values
                    </Heading>
                    <Box w="30vw" maxWidth="640px">
                        {createBarChart(parameterUsages)}
                    </Box>
                </Stack>
            )}
        </Stack>
    );
};

const createBarChart = function (parameterUsages: Map<string, number>): React.ReactElement {
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
                display: false,
            },
            tooltip: {
                interaction: {
                    axis: 'y',
                },
                intersect: false,
            },
        },
    };

    const sortedParameterUsages = new Map([...parameterUsages.entries()].sort((a, b) => b[1] - a[1]));
    const labels = [...sortedParameterUsages.keys()].slice(0, 10);

    const data = {
        labels,
        datasets: [
            {
                data: labels.map((key) => sortedParameterUsages.get(key)),
                borderColor: labels.map((key) => (isStringifiedLiteral(key) ? '#871F78' : '#888888')),
                backgroundColor: labels.map((key) => (isStringifiedLiteral(key) ? '#871F78' : '#888888')),
            },
        ],
    };

    return <Bar options={options} data={data} />;
};

const isStringifiedLiteral = function (value: string): boolean {
    if (value === 'None') {
        return true;
    }
    if (value.startsWith('"') && value.endsWith('"')) {
        return true;
    }
    if (value.startsWith("'") && value.endsWith("'")) {
        return true;
    }
    if (value === 'True' || value === 'False') {
        return true;
    }
    return !Number.isNaN(Number.parseFloat(value));
};
