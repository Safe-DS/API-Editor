import React from 'react';
import { VStack } from '@chakra-ui/react';
import { AnnotationStatistics } from './AnnotationStatistics';
import { ApiSizeStatistics } from './ApiSizeStatistics';
import { ApiSizeVsUsefulnessStatistics } from './ApiSizeVsUsefulnessStatistics';
import { ProgressStatistics } from './ProgressStatistics';
import { AchievementDisplay } from './AchievementDisplay';

export const StatisticsView: React.FC = function () {
    return (
        <VStack spacing={4}>
            <ProgressStatistics />
            <AnnotationStatistics />
            <ApiSizeStatistics />
            <ApiSizeVsUsefulnessStatistics />
            <AchievementDisplay />
        </VStack>
    );
};
