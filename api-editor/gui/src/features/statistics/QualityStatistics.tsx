import React from 'react';
import { Box, Heading, SimpleGrid, useColorModeValue, VStack } from '@chakra-ui/react';
import { useAppSelector } from '../../app/hooks';
import { Pie } from 'react-chartjs-2';

import { ArcElement, Chart as ChartJS, Title, Tooltip } from 'chart.js';
import { selectAnnotationStore } from '../annotations/annotationSlice';
import { Annotation, ReviewResult } from '../annotations/versioning/AnnotationStoreV2';

ChartJS.register(ArcElement, Title, Tooltip);

export const QualityStatistics = function () {
    const annotationStore = useAppSelector(selectAnnotationStore);

    return (
        <VStack spacing={2}>
            <Heading as="h3" size="md">
                Quality of Autogenerated Annotations
            </Heading>
            <Box width="100%">
                <SimpleGrid columns={{ base: 1, fullHD: 2 }} width="100%">
                    <QualityPieChart
                        annotationType="Boundary"
                        annotations={Object.values(annotationStore.boundaryAnnotations)}
                    />
                    <QualityPieChart
                        annotationType="Enum"
                        annotations={Object.values(annotationStore.enumAnnotations)}
                    />
                    <QualityPieChart
                        annotationType="Remove"
                        annotations={Object.values(annotationStore.removeAnnotations)}
                    />
                    <QualityPieChart
                        annotationType="Value"
                        annotations={Object.values(annotationStore.valueAnnotations)}
                    />
                </SimpleGrid>
            </Box>
        </VStack>
    );
};

interface QualityPieChartProps {
    annotationType: string;
    annotations: Annotation[];
}

const QualityPieChart: React.FC<QualityPieChartProps> = function ({ annotationType, annotations }) {
    const correctBg = useColorModeValue('#38a169', '#68d391');
    const correctBorder = useColorModeValue('#2f855a', '#99e6b3');

    const changedBg = useColorModeValue('#a16e38', '#d39568');
    const changedBorder = useColorModeValue('#855d2f', '#e6c099');

    const wrongOrRemovedBg = useColorModeValue('#a13838', '#d36868');
    const wrongOrRemovedBorder = useColorModeValue('#852f2f', '#e69999');

    const unsureBg = useColorModeValue('#a19038', '#d3ba68');
    const unsureBorder = useColorModeValue('#857a2f', '#e6d799');

    const uncheckedBg = useColorModeValue('#CCC', '#888');
    const uncheckedBorder = useColorModeValue('#AAA', '#AAA');

    const textColor = useColorModeValue('#000', '#FFF');

    const autogeneratedAnnotations = annotations.filter((it) => (it.authors ?? []).includes('$autogen$'));
    const numberOfCorrectAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && it.reviewResult === ReviewResult.Correct && (it.authors ?? []).length <= 1,
    ).length;
    const numberOfChangedAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && it.reviewResult === ReviewResult.Correct && (it.authors ?? []).length > 1,
    ).length;
    const numberOfWrongOrRemovedAnnotations = autogeneratedAnnotations.filter(
        (it) => it.isRemoved || it.reviewResult === ReviewResult.Wrong,
    ).length;
    const numberOfUnsureAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && it.reviewResult === ReviewResult.Unsure,
    ).length;
    const numberOfUncheckedAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && (it.reviewers ?? [])?.length === 0,
    ).length;

    const data = {
        labels: ['Correct', 'Changed', 'Wrong or Removed', 'Unsure', 'Unchecked'],
        datasets: [
            {
                data: [
                    numberOfCorrectAnnotations,
                    numberOfChangedAnnotations,
                    numberOfWrongOrRemovedAnnotations,
                    numberOfUnsureAnnotations,
                    numberOfUncheckedAnnotations,
                ],
                backgroundColor: [correctBg, changedBg, wrongOrRemovedBg, unsureBg, uncheckedBg],
                borderColor: [correctBorder, changedBorder, wrongOrRemovedBorder, unsureBorder, uncheckedBorder],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            title: {
                display: true,
                text: annotationType,
                color: textColor,
            },
        },
    };

    return (
        <Box>
            <Pie data={data} options={options} />
        </Box>
    );
};
