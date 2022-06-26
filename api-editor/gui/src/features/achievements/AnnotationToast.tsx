import { Heading, HStack, Img, Text as ChakraText, useToast, VStack } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import {
    selectNumberOfAnnotationsChanged,
    selectNumberOfAnnotationsCreated,
    selectNumberOfAnnotationsDeleted,
    selectNumberOfAnnotationsMarkedAsCorrect,
    selectNumberOfElementsMarkedAsComplete,
} from '../annotations/annotationSlice';
import {
    Achievement,
    auditorAchievement,
    authorAchievement,
    cleanerAchievement,
    completionistAchievement,
    editorAchievement,
} from './achievements';

export const useAnnotationToasts = () => {
    useAnnotationToast(auditorAchievement, useAppSelector(selectNumberOfAnnotationsMarkedAsCorrect));
    useAnnotationToast(authorAchievement, useAppSelector(selectNumberOfAnnotationsCreated));
    useAnnotationToast(cleanerAchievement, useAppSelector(selectNumberOfAnnotationsDeleted));
    useAnnotationToast(completionistAchievement, useAppSelector(selectNumberOfElementsMarkedAsComplete));
    useAnnotationToast(editorAchievement, useAppSelector(selectNumberOfAnnotationsChanged));
};

const useAnnotationToast = (achievement: Achievement, currentCount: number) => {
    const toast = useToast();
    const [previousLabel, setPreviousLabel] = React.useState<string>("");

    useEffect(() => {
        if (currentCount === 0) {
            return;
        }

        // Achievement is not unlocked yet
        const currentAchievementLevel = achievement.level(currentCount);
        if (!currentAchievementLevel) {
            return;
        }

        // Prevent messages when only the count but not the label changes
        if (currentAchievementLevel.label === previousLabel) {
            return;
        }
        setPreviousLabel(currentAchievementLevel.label);

        toast({
            duration: 4000,
            isClosable: true,
            render: () => (
                <AnnotationToast image={currentAchievementLevel.image} label={currentAchievementLevel.label} />
            ),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [achievement, currentCount, toast]);
};

interface AnnotationToastProps {
    image: string;
    label: string;
}

const AnnotationToast: React.FC<AnnotationToastProps> = function ({ image, label }) {
    return (
        <HStack
            bgGradient="linear(to-r, #afafaf, #ededed 18%, #c2c2c2, #f1f1f1)"
            color="black"
            h="200px"
            boxShadow="xl"
            rounded="md"
            border={1}
            layerStyle="subtleBorder"
            padding={4}
            spacing={4}
        >
            <Img src={image} alt={label} maxH="100%" />
            <VStack paddingRight={2}>
                <Heading size="md">Achievement unlocked!</Heading>
                <ChakraText textAlign="center">{`You are now a ${label}.`}</ChakraText>
            </VStack>
        </HStack>
    );
};
