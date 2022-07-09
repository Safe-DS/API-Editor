import React from 'react';
import { Box, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { useAppSelector } from '../../app/hooks';
import { Pie } from 'react-chartjs-2';

import { ArcElement, Chart as ChartJS, Title, Tooltip } from 'chart.js';
import { selectAnnotationStore } from '../annotations/annotationSlice';
import { Annotation, ReviewResult } from '../annotations/versioning/AnnotationStoreV2';

ChartJS.register(ArcElement, Title, Tooltip);

export const QualityStatistics = function () {
    const annotationStore = useAppSelector(selectAnnotationStore);

    return (
        <Box width="100%">
            <SimpleGrid columns={{ base: 1, fullHD: 2 }} width="100%">
                <QualityPieChart
                    annotationType="Boundary"
                    annotations={Object.values(annotationStore.boundaryAnnotations)}
                />
                <QualityPieChart annotationType="Enum" annotations={Object.values(annotationStore.enumAnnotations)} />
                <QualityPieChart
                    annotationType="Remove"
                    annotations={Object.values(annotationStore.removeAnnotations)}
                />
                <QualityPieChart annotationType="Value" annotations={Object.values(annotationStore.valueAnnotations)} />
            </SimpleGrid>
        </Box>
    );
};

interface QualityPieChartProps {
    annotationType: string;
    annotations: Annotation[];
}

const QualityPieChart: React.FC<QualityPieChartProps> = function ({ annotationType, annotations }) {
    const correctBg = useColorModeValue('rgba(56, 161, 105, 0.2)', 'rgba(104, 211, 145, 0.2)');
    const correctBorder = useColorModeValue('rgba(47, 133, 90, 1)', 'rgba(153, 230, 179, 1)');

    const changedBg = useColorModeValue('rgba(161, 110, 56, 0.2)', 'rgba(211, 149, 104, 0.2)');
    const changedBorder = useColorModeValue('rgba(133, 93, 47, 1)', 'rgba(230, 192, 153, 1)');

    const wrongOrRemovedBg = useColorModeValue('rgba(161, 56, 56, 0.2)', 'rgba(211, 104, 104, 0.2)');
    const wrongOrRemovedBorder = useColorModeValue('rgba(133, 47, 47, 1)', 'rgba(230, 153, 153, 1)');

    const missedBg = useColorModeValue('rgba(114,56,161,0.2)', 'rgba(168,104,211,0.2)');
    const missedBorder = useColorModeValue('rgb(89,47,133)', 'rgb(193,153,230)');

    const unsureBg = useColorModeValue('rgba(161, 144, 56, 0.2)', 'rgba(211, 186, 104, 0.2)');
    const unsureBorder = useColorModeValue('rgba(133, 122, 47, 1)', 'rgba(230, 215, 153, 1)');

    const uncheckedBg = useColorModeValue('rgba(204, 204, 204, 0.2)', 'rgba(136, 136, 136, 0.2)');
    const uncheckedBorder = useColorModeValue('rgba(170, 170, 170, 1)', 'rgba(170, 170, 170, 1)');

    const textColor = useColorModeValue('#000', '#FFF');

    const autogeneratedAnnotations = annotations.filter((it) => (it.authors ?? []).includes('$autogen$'));
    const manualAnnotations = annotations.filter((it) => !(it.authors ?? []).includes('$autogen$'));

    const numberOfCorrectAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && isCorrect(it) && (it.authors ?? []).length <= 1,
    ).length;
    const numberOfChangedAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && isCorrect(it) && (it.authors ?? []).length > 1,
    ).length;
    const numberOfWrongOrRemovedAnnotations = autogeneratedAnnotations.filter(
        (it) => it.isRemoved || it.reviewResult === ReviewResult.Wrong,
    ).length;
    const numberOfMissedAnnotations = manualAnnotations.filter((it) => !it.isRemoved && isCorrect(it)).length;
    const numberOfUnsureAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && it.reviewResult === ReviewResult.Unsure,
    ).length;
    const numberOfUncheckedAnnotations = autogeneratedAnnotations.filter(
        (it) => !it.isRemoved && (it.reviewers ?? [])?.length === 0,
    ).length;

    const data = {
        labels: ['Correct', 'Changed', 'Wrong or Removed', 'Missed', 'Unsure', 'Unchecked'],
        datasets: [
            {
                data: [
                    numberOfCorrectAnnotations,
                    numberOfChangedAnnotations,
                    numberOfWrongOrRemovedAnnotations,
                    numberOfMissedAnnotations,
                    numberOfUnsureAnnotations,
                    numberOfUncheckedAnnotations,
                ],
                backgroundColor: [correctBg, changedBg, wrongOrRemovedBg, missedBg, unsureBg, uncheckedBg],
                borderColor: [
                    correctBorder,
                    changedBorder,
                    wrongOrRemovedBorder,
                    missedBorder,
                    unsureBorder,
                    uncheckedBorder,
                ],
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

const isCorrect = function (annotation: Annotation): boolean {
    return (
        annotation.reviewResult === ReviewResult.Correct ||
        ((annotation.reviewers?.length ?? 0) > 0 && !annotation.reviewResult)
    );
};
