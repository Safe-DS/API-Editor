import React from 'react';
import { Button, Heading, SimpleGrid, VStack } from '@chakra-ui/react';
import { selectAnnotationStore } from '../annotations/annotationSlice';
import { Annotation } from '../annotations/versioning/AnnotationStoreV2';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectFilterString, setFilterString } from '../ui/uiSlice';
import { selectMatchedNodes } from '../packageData/apiSlice';

export const AnnotationStatistics = function () {
    const dispatch = useAppDispatch();

    const matchedIds = useAppSelector(selectMatchedNodes).map((it) => it.id);

    const annotations = useAppSelector(selectAnnotationStore);
    const nBoundaryAnnotations = countNonRepeatableAnnotation(annotations.boundaryAnnotations, matchedIds);
    const nCalledAfterAnnotations = countRepeatableAnnotation(annotations.calledAfterAnnotations, matchedIds);
    const nDescriptionAnnotations = countNonRepeatableAnnotation(annotations.descriptionAnnotations, matchedIds);
    const nEnumAnnotations = countNonRepeatableAnnotation(annotations.enumAnnotations, matchedIds);
    const nGroupAnnotations = countRepeatableAnnotation(annotations.groupAnnotations, matchedIds);
    const nMoveAnnotations = countNonRepeatableAnnotation(annotations.moveAnnotations, matchedIds);
    const nPureAnnotations = countNonRepeatableAnnotation(annotations.pureAnnotations, matchedIds);
    const nRemoveAnnotations = countNonRepeatableAnnotation(annotations.removeAnnotations, matchedIds);
    const nRenameAnnotations = countNonRepeatableAnnotation(annotations.renameAnnotations, matchedIds);
    const nTodoAnnotations = countNonRepeatableAnnotation(annotations.todoAnnotations, matchedIds);
    const nValueAnnotations = countNonRepeatableAnnotation(annotations.valueAnnotations, matchedIds);
    const sum =
        nBoundaryAnnotations +
        nCalledAfterAnnotations +
        nDescriptionAnnotations +
        nEnumAnnotations +
        nGroupAnnotations +
        nMoveAnnotations +
        nPureAnnotations +
        nRemoveAnnotations +
        nRenameAnnotations +
        nTodoAnnotations +
        nValueAnnotations;

    const filterString = useAppSelector(selectFilterString);

    const filterAction = (newAnnotationFilterString: string) => {
        const annotationFilterPrefix = 'annotation:';

        const newFilterString = [
            ...filterString.split(' ').filter((it) => !it.startsWith(annotationFilterPrefix)),
            newAnnotationFilterString,
        ]
            .filter((it) => it.length > 0)
            .join(' ');

        dispatch(setFilterString(newFilterString));
    };

    return (
        <VStack spacing={4}>
            <Heading as="h3" size="md">
                Annotations on Matched Elements
            </Heading>
            <SimpleGrid columns={{ base: 1, fullHD: 2 }} spacing={2}>
                <Button onClick={() => filterAction('')}>Clear Filter</Button>
                <Button onClick={() => filterAction('annotation:any')}>{'Any: ' + sum}</Button>

                <Button onClick={() => filterAction('annotation:@boundary')}>{'@Boundary: ' + nBoundaryAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@calledAfter')}>
                    {'@CalledAfter: ' + nCalledAfterAnnotations}
                </Button>
                <Button onClick={() => filterAction('annotation:@description')}>
                    {'@Description: ' + nDescriptionAnnotations}
                </Button>
                <Button onClick={() => filterAction('annotation:@enum')}>{'@Enum: ' + nEnumAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@group')}>{'@Group: ' + nGroupAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@move')}>{'@Move: ' + nMoveAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@pure')}>{'@Pure: ' + nPureAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@remove')}>{'@Remove: ' + nRemoveAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@rename')}>{'@Rename: ' + nRenameAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@todo')}>{'@Todo: ' + nTodoAnnotations}</Button>
                <Button onClick={() => filterAction('annotation:@value')}>{'@Value: ' + nValueAnnotations}</Button>
            </SimpleGrid>
        </VStack>
    );
};

const countNonRepeatableAnnotation = (
    targetToAnnotation: { [target: string]: Annotation } | void,
    matchedIds: string[],
) => {
    return Object.values(targetToAnnotation ?? {}).filter((it) => it && !it.isRemoved && matchedIds.includes(it.target))
        .length;
};

const countRepeatableAnnotation = (
    targetToNameToAnnotation: { [target: string]: { [name: string]: Annotation } } | void,
    matchedIds: string[],
) => {
    return Object.entries(targetToNameToAnnotation ?? {}).reduce((acc, [target, nameToAnnotations]) => {
        if (matchedIds.includes(target)) {
            return acc + Object.values(nameToAnnotations).filter((it) => it && !it.isRemoved).length;
        } else {
            return acc;
        }
    }, 0);
};
