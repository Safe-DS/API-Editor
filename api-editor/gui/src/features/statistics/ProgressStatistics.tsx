import React from 'react';
import { Box, Heading, HStack, useColorModeValue, VStack } from '@chakra-ui/react';
import { useAppSelector } from '../../app/hooks';
import { selectMatchedNodes } from '../packageData/apiSlice';
import { selectAllAnnotationsOnTargets, selectAnnotationStore } from '../annotations/annotationSlice';
import { Pie } from 'react-chartjs-2';

import { ArcElement, Chart as ChartJS, Title, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip);

export const ProgressStatistics = function () {
    const completeOrCorrectBg = useColorModeValue('#38a169', '#68d391');
    const completeOrCorrectBorder = useColorModeValue('#2f855a', '#99e6b3');

    const uncheckedBg = useColorModeValue('#CCC', '#888');
    const uncheckedBorder = useColorModeValue('#AAA', '#AAA');

    const textColor = useColorModeValue('#000', '#FFF');

    // Completion Progress
    const completed = useAppSelector(selectAnnotationStore).completes;
    const matchedNodes = useAppSelector(selectMatchedNodes);
    const numberOfMatchedNodes = matchedNodes.length;
    const numberOfCompleteMatchedNodes = matchedNodes.filter((it) => it.id in completed).length;

    const completionData = {
        labels: ['Complete', 'Unchecked'],
        datasets: [
            {
                data: [numberOfCompleteMatchedNodes, numberOfMatchedNodes - numberOfCompleteMatchedNodes],
                backgroundColor: [completeOrCorrectBg, uncheckedBg],
                borderColor: [completeOrCorrectBorder, uncheckedBorder],
                borderWidth: 1,
            },
        ],
    };

    const completionOptions = {
        plugins: {
            title: {
                display: true,
                text: 'Completion Progress',
                color: textColor,
            },
        },
    };

    // Review Progress
    const allAnnotations = useAppSelector(selectAllAnnotationsOnTargets(matchedNodes.map((it) => it.id)));
    const numberOfAnnotations = allAnnotations.length;
    const numberOfReviewedAnnotations = allAnnotations.filter((it) => (it.reviewers?.length ?? 0) > 0).length;

    const correctnessData = {
        labels: ['Correct', 'Unchecked'],
        datasets: [
            {
                data: [numberOfReviewedAnnotations, numberOfAnnotations - numberOfReviewedAnnotations],
                backgroundColor: [completeOrCorrectBg, uncheckedBg],
                borderColor: [completeOrCorrectBorder, uncheckedBorder],
                borderWidth: 1,
            },
        ],
    };

    const correctnessOptions = {
        plugins: {
            title: {
                display: true,
                text: 'Review Progress',
                color: textColor,
            },
        },
    };

    return (
        <VStack spacing={2}>
            <Heading as="h3" size="md">
                Progress on Matched Elements
            </Heading>
            <Box width="100%">
                <HStack width="100%" justify="space-between">
                    <Box width="40%">
                        <Pie data={completionData} options={completionOptions} />
                    </Box>
                    <Box width="40%">
                        <Pie data={correctnessData} options={correctnessOptions} />
                    </Box>
                </HStack>
            </Box>
        </VStack>
    );
};
