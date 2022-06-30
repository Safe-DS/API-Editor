import React from 'react';
import { VStack } from '@chakra-ui/react';
import { AnnotationStatistics } from './AnnotationStatistics';
import { ApiSizeStatistics } from './ApiSizeStatistics';
import { ApiSizeVsUsefulnessStatistics } from './ApiSizeVsUsefulnessStatistics';
import { ProgressStatistics } from './ProgressStatistics';
import { AchievementDisplay } from '../achievements/AchievementDisplay';
import { QualityStatistics } from './QualityStatistics';

export const StatisticsView: React.FC = function () {
    return (
        <VStack spacing={8}>
            <ProgressStatistics />
            <AnnotationStatistics />
            <ApiSizeStatistics />
            <ApiSizeVsUsefulnessStatistics />
            <QualityStatistics />
            <AchievementDisplay />
        </VStack>
    );
};
