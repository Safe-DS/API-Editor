import React from 'react';
import { Button, Heading, SimpleGrid } from '@chakra-ui/react';
import { Annotation, selectAnnotationStore } from '../annotations/annotationSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectFilterString, setFilterString } from '../ui/uiSlice';
import { selectMatchedNodes } from '../packageData/apiSlice';

export const AnnotationStatistics = function () {
    const dispatch = useAppDispatch();

    const matchedIds = useAppSelector(selectMatchedNodes).map((it) => it.id);

    const annotations = useAppSelector(selectAnnotationStore);
    const attributesSize = countNonRepeatableAnnotation(annotations.attributes, matchedIds);
    const boundariesSize = countNonRepeatableAnnotation(annotations.boundaries, matchedIds);
    const calledAftersSize = countRepeatableAnnotation(annotations.calledAfters, matchedIds);
    const constantsSize = countNonRepeatableAnnotation(annotations.constants, matchedIds);
    const descriptionSize = countNonRepeatableAnnotation(annotations.descriptions, matchedIds);
    const enumsSize = countNonRepeatableAnnotation(annotations.enums, matchedIds);
    const groupsSize = countRepeatableAnnotation(annotations.groups, matchedIds);
    const optionalsSize = countNonRepeatableAnnotation(annotations.optionals, matchedIds);
    const movesSize = countNonRepeatableAnnotation(annotations.moves, matchedIds);
    const puresSize = countNonRepeatableAnnotation(annotations.pures, matchedIds);
    const removesSize = countNonRepeatableAnnotation(annotations.removes, matchedIds);
    const renamingsSize = countNonRepeatableAnnotation(annotations.renamings, matchedIds);
    const requiredsSize = countNonRepeatableAnnotation(annotations.requireds, matchedIds);
    const todoSize = countNonRepeatableAnnotation(annotations.todos, matchedIds);
    const sum =
        attributesSize +
        boundariesSize +
        calledAftersSize +
        constantsSize +
        descriptionSize +
        enumsSize +
        groupsSize +
        optionalsSize +
        movesSize +
        puresSize +
        removesSize +
        renamingsSize +
        requiredsSize +
        todoSize;

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
        <>
            <Heading as="h3" size="md">
                Annotations on Matched Elements
            </Heading>
            <SimpleGrid columns={2} spacing={2}>
                <Button onClick={() => filterAction('')}>Clear Filter</Button>
                <Button onClick={() => filterAction('annotation:any')}>{'Any: ' + sum}</Button>

                <Button onClick={() => filterAction('annotation:@attribute')}>{'@Attribute: ' + attributesSize}</Button>
                <Button onClick={() => filterAction('annotation:@boundary')}>{'@Boundary: ' + boundariesSize}</Button>
                <Button onClick={() => filterAction('annotation:@calledAfter')}>
                    {'@CalledAfter: ' + calledAftersSize}
                </Button>
                <Button onClick={() => filterAction('annotation:@constant')}>{'@Constant: ' + constantsSize}</Button>
                <Button onClick={() => filterAction('annotation:@description')}>
                    {'@Description: ' + descriptionSize}
                </Button>
                <Button onClick={() => filterAction('annotation:@enum')}>{'@Enum: ' + enumsSize}</Button>
                <Button onClick={() => filterAction('annotation:@group')}>{'@Group: ' + groupsSize}</Button>
                <Button onClick={() => filterAction('annotation:@move')}>{'@Move: ' + movesSize}</Button>
                <Button onClick={() => filterAction('annotation:@optional')}>{'@Optional: ' + optionalsSize}</Button>
                <Button onClick={() => filterAction('annotation:@pure')}>{'@Pure: ' + puresSize}</Button>
                <Button onClick={() => filterAction('annotation:@remove')}>{'@Remove: ' + removesSize}</Button>
                <Button onClick={() => filterAction('annotation:@rename')}>{'@Rename: ' + renamingsSize}</Button>
                <Button onClick={() => filterAction('annotation:@required')}>{'@Required: ' + requiredsSize}</Button>
                <Button onClick={() => filterAction('annotation:@todo')}>{'@Todo: ' + todoSize}</Button>
            </SimpleGrid>
        </>
    );
};

const countNonRepeatableAnnotation = (targetToAnnotation: { [target: string]: Annotation }, matchedIds: string[]) => {
    return Object.values(targetToAnnotation).filter((it) => it && !it.isRemoved && matchedIds.includes(it.target))
        .length;
};

const countRepeatableAnnotation = (
    targetToNameToAnnotation: { [target: string]: { [name: string]: Annotation } },
    matchedIds: string[],
) => {
    return Object.entries(targetToNameToAnnotation).reduce((acc, [target, nameToAnnotations]) => {
        if (matchedIds.includes(target)) {
            return acc + Object.values(nameToAnnotations).filter((it) => it && !it.isRemoved).length;
        } else {
            return acc;
        }
    }, 0);
};
