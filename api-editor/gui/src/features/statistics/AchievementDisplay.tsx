import { Box, Center, Heading, Img, SimpleGrid, Text as ChakraText, VStack } from '@chakra-ui/react';
import React from 'react';
import { useAppSelector } from '../../app/hooks';
import {
    selectNumberOfAnnotationsChanged,
    selectNumberOfAnnotationsCreated,
    selectNumberOfAnnotationsDeleted,
    selectNumberOfAnnotationsMarkedAsCorrect,
    selectNumberOfElementsMarkedAsComplete,
} from '../annotations/annotationSlice';

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
                <SimpleGrid columns={2} spacing={4}>
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

const pluralize = function (count: number, noun: string): string {
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
};

interface AchievementCardProps {
    achievement: Achievement;
    currentCount: number;
    description: string;
}

const AchievementCard: React.FC<AchievementCardProps> = function ({ achievement, currentCount, description }) {
    const currentAchievementLevel = achievement.level(currentCount);
    if (!currentAchievementLevel) {
        return null;
    }

    return (
        <VStack boxShadow="xl" rounded="md" border={1} layerStyle="subtleBorder" padding={4}>
            <Img src={currentAchievementLevel.image} alt={currentAchievementLevel.label} />
            <Center fontWeight="bold">
                <ChakraText>{currentAchievementLevel.label}</ChakraText>
            </Center>
            <Center>
                <ChakraText textAlign="center">{description}</ChakraText>
            </Center>
        </VStack>
    );
};

interface CurrentAchievementLevel {
    label: string;
    image: string;
}

const baseBadgesPath = '/img/badges';

class Achievement {
    private readonly levels: AchievementLevel[];

    constructor(readonly name: string, levels: AchievementLevel[]) {
        this.levels = [...levels].sort((a, b) => b.unlockCriteria - a.unlockCriteria);
    }

    level(currentCount: number): CurrentAchievementLevel | null {
        const achievementLevel = this.levels.find((it) => currentCount >= it.unlockCriteria);
        if (!achievementLevel) {
            return null;
        }

        return {
            label: `${achievementLevel.prefix} ${this.name}`,
            image: achievementLevel.badgeURL,
        };
    }
}

class AchievementLevel {
    readonly badgeURL: string;

    constructor(readonly prefix: string, readonly unlockCriteria: number, badgeName: string) {
        this.badgeURL = `${baseBadgesPath}/${badgeName}.png`;
    }
}

export const auditorAchievement = new Achievement('Auditor', [
    new AchievementLevel('Rookie', 1, '0 Stars Auditor'),
    new AchievementLevel('Beginner', 10, '1 Star Auditor'),
    new AchievementLevel('Senior', 100, '2 Stars Auditor'),
    new AchievementLevel('Pro', 250, '3 Stars Auditor'),
    new AchievementLevel('Expert', 500, '4 Stars Auditor'),
    new AchievementLevel('Master', 1000, '5 Stars Auditor'),
]);
export const authorAchievement = new Achievement('Author', [
    new AchievementLevel('Rookie', 1, '0 Stars Author'),
    new AchievementLevel('Beginner', 10, '1 Star Author'),
    new AchievementLevel('Senior', 100, '2 Stars Author'),
    new AchievementLevel('Pro', 250, '3 Stars Author'),
    new AchievementLevel('Expert', 500, '4 Stars Author'),
    new AchievementLevel('Master', 1000, '5 Stars Author'),
]);
export const cleanerAchievement = new Achievement('Cleaner', [
    new AchievementLevel('Rookie', 1, '0 Stars Cleaner'),
    new AchievementLevel('Beginner', 10, '1 Star Cleaner'),
    new AchievementLevel('Senior', 100, '2 Stars Cleaner'),
    new AchievementLevel('Pro', 250, '3 Stars Cleaner'),
    new AchievementLevel('Expert', 500, '4 Stars Cleaner'),
    new AchievementLevel('Master', 1000, '5 Stars Cleaner'),
]);
export const completionistAchievement = new Achievement('Completionist', [
    new AchievementLevel('Rookie', 1, '0 Stars Completionist'),
    new AchievementLevel('Beginner', 10, '1 Star Completionist'),
    new AchievementLevel('Senior', 100, '2 Stars Completionist'),
    new AchievementLevel('Pro', 250, '3 Stars Completionist'),
    new AchievementLevel('Expert', 500, '4 Stars Completionist'),
    new AchievementLevel('Master', 1000, '5 Stars Completionist'),
]);
export const editorAchievement = new Achievement('Editor', [
    new AchievementLevel('Rookie', 1, '0 Stars Editor'),
    new AchievementLevel('Beginner', 10, '1 Star Editor'),
    new AchievementLevel('Senior', 100, '2 Stars Editor'),
    new AchievementLevel('Pro', 250, '3 Stars Editor'),
    new AchievementLevel('Expert', 500, '4 Stars Editor'),
    new AchievementLevel('Master', 1000, '5 Stars Editor'),
]);
