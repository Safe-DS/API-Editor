import React from 'react';
import { Heading, VStack } from '@chakra-ui/react';
import { AnnotationStatistics } from './AnnotationStatistics';
import { ApiSizeStatistics } from './ApiSizeStatistics';
import { ApiSizeVsUsefulnessStatistics } from './ApiSizeVsUsefulnessStatistics';

export const StatisticsView: React.FC = function () {
    return (
        <VStack spacing={4}>
            <Heading as="h3" size="md">
                Progress
            </Heading>
            <AnnotationStatistics />
            <ApiSizeStatistics />
            <ApiSizeVsUsefulnessStatistics />
        </VStack>
    );
};
