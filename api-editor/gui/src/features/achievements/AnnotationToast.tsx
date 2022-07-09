import { Heading, HStack, Img, Text as ChakraText, useToast, VStack } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    selectNumberOfAnnotationsChanged,
    selectNumberOfAnnotationsCreated,
    selectNumberOfAnnotationsDeleted,
    selectNumberOfAnnotationsMarkedAsCorrect, selectNumberOfCommentsTouched,
    selectNumberOfElementsMarkedAsComplete,
} from '../annotations/annotationSlice';
import {
    Achievement,
    auditorAchievement,
    authorAchievement,
    cleanerAchievement, commentatorAchievement,
    completionistAchievement,
    editorAchievement,
} from './achievements';
import { rememberTitle, selectCelebratedTitles, selectUIIsLoaded } from '../ui/uiSlice';

export const useAnnotationToasts = () => {
    useAnnotationToast(auditorAchievement, useAppSelector(selectNumberOfAnnotationsMarkedAsCorrect));
    useAnnotationToast(authorAchievement, useAppSelector(selectNumberOfAnnotationsCreated));
    useAnnotationToast(cleanerAchievement, useAppSelector(selectNumberOfAnnotationsDeleted));
    useAnnotationToast(completionistAchievement, useAppSelector(selectNumberOfElementsMarkedAsComplete));
    useAnnotationToast(commentatorAchievement, useAppSelector(selectNumberOfCommentsTouched));
    useAnnotationToast(editorAchievement, useAppSelector(selectNumberOfAnnotationsChanged));
};

const useAnnotationToast = (achievement: Achievement, currentCount: number) => {
    const toast = useToast();
    const dispatch = useAppDispatch();
    const celebratedTitles = useAppSelector(selectCelebratedTitles);
    const uiIsLoaded = useAppSelector(selectUIIsLoaded);

    useEffect(() => {
        // UI is not loaded yet
        if (!uiIsLoaded) {
            return;
        }

        // Achievement is not unlocked yet
        const currentAchievementLevel = achievement.level(currentCount);
        if (!currentAchievementLevel) {
            return;
        }

        // Prevent duplicate messages
        if (celebratedTitles.includes(currentAchievementLevel.title)) {
            return;
        }
        dispatch(rememberTitle(currentAchievementLevel.title));

        toast({
            duration: 5000,
            isClosable: true,
            render: () => (
                <AnnotationToast image={currentAchievementLevel.image} label={currentAchievementLevel.title} />
            ),
        });
    }, [achievement, celebratedTitles, currentCount, uiIsLoaded, dispatch, toast]);
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
