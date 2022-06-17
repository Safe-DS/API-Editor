import {Heading, Stack, Text as ChakraText} from '@chakra-ui/react';
import React, {ReactElement} from 'react';
import {PythonParameter} from '../model/PythonParameter';
import {ParameterNode} from './ParameterNode';
import {UsageCountStore} from "../../usages/model/UsageCountStore";
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
import {Bar} from 'react-chartjs-2';

ChartJS.register(CategoryScale, PointElement, LineElement, LinearScale, BarElement, Title, Tooltip);


interface ParameterViewProps {
    pythonParameter: PythonParameter;
    usages: UsageCountStore;
}

export const ParameterView: React.FC<ParameterViewProps> = function ({pythonParameter, usages}) {
    const parameterUsages = usages.valueUsages.get(pythonParameter.id);
    //parameterUsages is of type Map<string, number>
    //only use the 10 most used parameters
    return (
        <Stack spacing={8}>
            <ParameterNode isTitle pythonParameter={pythonParameter}/>

            {pythonParameter.defaultValue && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Default value
                    </Heading>
                    <ChakraText paddingLeft={4}>{pythonParameter.defaultValue}</ChakraText>
                </Stack>
            )}

            {pythonParameter.typeInDocs && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Type
                    </Heading>
                    <ChakraText paddingLeft={4}>{pythonParameter.typeInDocs}</ChakraText>
                </Stack>
            )}

            {parameterUsages && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Usages
                    </Heading>
                    {createBarChart(parameterUsages, pythonParameter.name)}
                </Stack>
            )}
        </Stack>
    );
};

let createBarChart = function (parameterUsages: Map<string, number>, parameter: string): ReactElement {
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
                text: `${parameter} usages`,
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
                borderColor: labels.map((key) => isStringifiedLiteral(key) ? '#871F78' : '#888888'),
                backgroundColor: labels.map((key) => isStringifiedLiteral(key) ? '#871F78' : '#888888'),
            },
        ],
    };

    return <Bar options={options} data={data}/>;
};

let isStringifiedLiteral = function (value: string): boolean {
    if (value === 'None') {
        return true;
    }
    if (value.startsWith('"') && value.endsWith('"')) {
        return true;
    }
    if (value.startsWith("'") && value.endsWith("'")) {
        return true;
    }
    if (value === "True" || value === "False") {
        return true;
    }
    return !!value.match(/^-?\d+$/);

}
