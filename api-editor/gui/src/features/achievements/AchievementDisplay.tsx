import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import { useAppSelector } from '../../app/hooks';
import {
    selectNumberOfAnnotationsChanged,
    selectNumberOfAnnotationsCreated,
    selectNumberOfAnnotationsDeleted,
    selectNumberOfAnnotationsMarkedAsCorrect,
    selectNumberOfElementsMarkedAsComplete,
} from '../annotations/annotationSlice';
import { pluralize } from '../../common/util/stringOperations';
import {
    auditorAchievement,
    authorAchievement,
    cleanerAchievement,
    completionistAchievement,
    editorAchievement,
} from './achievements';
import { AchievementCard } from './AchievementCard';

export const AchievementDisplay: React.FC = function () {
    const auditorCount = useAppSelector(selectNumberOfAnnotationsMarkedAsCorrect);
    const authorCount = useAppSelector(selectNumberOfAnnotationsCreated);
    const cleanerCount = useAppSelector(selectNumberOfAnnotationsDeleted);
    const completionistCount = useAppSelector(selectNumberOfElementsMarkedAsComplete);
    const editorCount = useAppSelector(selectNumberOfAnnotationsChanged);

    if (
        auditorCount === 0 &&
        authorCount === 0 &&
        cleanerCount === 0 &&
        completionistCount === 0 &&
        editorCount === 0
    ) {
        return null;
    }

    return (
        <>
            <Heading as="h3" size="md">
                Achievements
            </Heading>
            <Box>
                <SimpleGrid columns={{ base: 1, wqhd: 2 }} spacing={4}>
                    <AchievementCard
                        currentCount={auditorCount}
                        achievement={auditorAchievement}
                        description={`${pluralize(auditorCount, 'annotation')} marked as correct`}
                    />
                    <AchievementCard
                        currentCount={authorCount}
                        achievement={authorAchievement}
                        description={`${pluralize(authorCount, 'annotation')} created`}
                    />
                    <AchievementCard
                        currentCount={cleanerCount}
                        achievement={cleanerAchievement}
                        description={`${pluralize(cleanerCount, 'annotation')} removed`}
                    />
                    <AchievementCard
                        currentCount={completionistCount}
                        achievement={completionistAchievement}
                        description={`${pluralize(completionistCount, 'API element')} marked as complete`}
                    />
                    <AchievementCard
                        currentCount={editorCount}
                        achievement={editorAchievement}
                        description={`${pluralize(editorCount, 'annotation')} changed`}
                    />
                </SimpleGrid>
            </Box>
        </>
    );
};
