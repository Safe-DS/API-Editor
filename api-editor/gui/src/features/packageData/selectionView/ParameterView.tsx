import { Box, Heading, HStack, Stack, Text as ChakraText, useColorModeValue } from '@chakra-ui/react';
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

            {pythonParameter && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Default Value
                    </Heading>

                    {pythonParameter.defaultValue ? (
                        <Stack>
                            <ChakraText paddingLeft={4}>
                                <Box as="span" fontWeight="bold">
                                    Code:
                                </Box>{' '}
                                {pythonParameter.defaultValue}
                            </ChakraText>

                            {pythonParameter.defaultValueInDocs ? (
                                <ChakraText paddingLeft={4}>
                                    <Box as="span" fontWeight="bold">
                                        Documentation:
                                    </Box>{' '}
                                    {pythonParameter.defaultValueInDocs}
                                </ChakraText>
                            ) : (
                                <HStack>
                                    <ChakraText paddingLeft={4}>
                                        <Box as="span" fontWeight="bold">
                                            Documentation:
                                        </Box>{' '}
                                        <Box as="span" color="gray.500">
                                            The documentation does not specify a default value.
                                        </Box>
                                    </ChakraText>
                                </HStack>
                            )}
                        </Stack>
                    ) : (
                        <ChakraText paddingLeft={4} color="gray.500">
                            The parameter is required.
                        </ChakraText>
                    )}
                </Stack>
            )}

            {parameterUsages && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Usages
                    </Heading>
                    <UsageSum parameterUsages={parameterUsages} />
                </Stack>
            )}

            {parameterUsages && (
                <Stack spacing={4}>
                    <Heading as="h4" size="md">
                        Most Common Values
                    </Heading>
                    <Box w="30vw" maxWidth="640px">
                        <CustomBarChart parameterUsages={parameterUsages} />
                    </Box>
                </Stack>
            )}
        </Stack>
    );
};

interface CustomBarChartProps {
    parameterUsages: Map<string, number>;
}

const CustomBarChart: React.FC<CustomBarChartProps> = function ({ parameterUsages }) {
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
                display: false,
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

    const sortedParameterUsages = new Map([...parameterUsages.entries()].sort((a, b) => b[1] - a[1]));
    const labels = [...sortedParameterUsages.keys()].slice(0, 10);

    const data = {
        labels,
        datasets: [
            {
                data: labels.map((key) => sortedParameterUsages.get(key)),
                borderColor: labels.map((key) =>
                    isStringifiedLiteral(key) ? 'rgba(137, 87, 229, 1)' : 'rgba(136, 136, 136, 1)',
                ),
                backgroundColor: labels.map((key) =>
                    isStringifiedLiteral(key) ? 'rgba(137, 87, 229, 0.2)' : 'rgba(136, 136, 136, 0.2)',
                ),
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

const UsageSum: React.FC<CustomBarChartProps> = function ({ parameterUsages }) {
    let usage = 0;

    parameterUsages.forEach((value) => {
        usage += value;
    });

    return <ChakraText paddingLeft={4}>{usage}</ChakraText>;
};
