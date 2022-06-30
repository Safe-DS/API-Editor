import { Center, Img, Text as ChakraText, VStack } from '@chakra-ui/react';
import React from 'react';
import { Achievement } from './achievements';

interface AchievementCardProps {
    achievement: Achievement;
    currentCount: number;
    description: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = function ({ achievement, currentCount, description }) {
    const currentAchievementLevel = achievement.level(currentCount);
    if (!currentAchievementLevel) {
        return null;
    }

    return (
        <VStack boxShadow="xl" rounded="md" border={1} layerStyle="subtleBorder" padding={4}>
            <Img src={currentAchievementLevel.image} alt={currentAchievementLevel.title} />
            <Center fontWeight="bold">
                <ChakraText>{currentAchievementLevel.title}</ChakraText>
            </Center>
            <Center>
                <ChakraText textAlign="center">{description}</ChakraText>
            </Center>
        </VStack>
    );
};
