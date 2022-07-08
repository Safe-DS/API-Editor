import React from 'react';
import {Box, Heading, SimpleGrid, useColorModeValue, VStack} from '@chakra-ui/react';
import {useAppSelector} from '../../app/hooks';
import {selectMatchedNodes} from '../packageData/apiSlice';
import {selectAllAnnotationsOnTargets, selectAnnotationStore} from '../annotations/annotationSlice';
import {Pie} from 'react-chartjs-2';

import {ArcElement, Chart as ChartJS, Title, Tooltip} from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip);

export const ProgressStatistics = function () {
    const completeOrCorrectBg = useColorModeValue('rgba(56, 161, 105, 0.2)', 'rgba(104, 211, 145, 0.2)');
    const completeOrCorrectBorder = useColorModeValue('rgba(47, 133, 90, 1)', 'rgba(153, 230, 179, 1)');

    const uncheckedBg = useColorModeValue('rgba(204, 204, 204, 0.2)', 'rgba(136, 136, 136, 0.2)');
    const uncheckedBorder = useColorModeValue('rgba(170, 170, 170, 1)', 'rgba(170, 170, 170, 1)');

    const textColor = useColorModeValue('#000', '#FFF');

    // Completion Progress
    const completed = useAppSelector(selectAnnotationStore).completeAnnotations;
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
                <SimpleGrid columns={{base: 1, fullHD: 2}} width="100%">
                    <Box>
                        <Pie data={completionData} options={completionOptions}/>
                    </Box>
                    <Box>
                        <Pie data={correctnessData} options={correctnessOptions}/>
                    </Box>
                </SimpleGrid>
            </Box>
        </VStack>
    );
};
