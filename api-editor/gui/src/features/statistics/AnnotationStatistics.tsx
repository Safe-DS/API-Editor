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

    const filterString = useAppSelector(selectFilterString);

    const filterAction = (annotation: string) => {
        const annotationFilterPrefix = 'annotation:@';
        const annotationFilterString = annotationFilterPrefix + annotation;

        //Remove existing annotation filter
        const filterList = filterString.split(' ');
        let newFilter = '';
        for (const element of filterList) {
            if (!element.startsWith(annotationFilterPrefix)) {
                newFilter += element;
                newFilter += ' ';
            }
        }

        newFilter += annotationFilterString;
        dispatch(setFilterString(newFilter));
    };

    return (
        <>
            <Heading as="h3" size="md">
                Annotations on Matched Elements
            </Heading>
            <SimpleGrid columns={2} spacing={2}>
                <Button onClick={() => filterAction('attribute')} children={'Attributes: ' + attributesSize}></Button>
                <Button onClick={() => filterAction('boundary')} children={'Boundaries: ' + boundariesSize}></Button>
                <Button
                    onClick={() => filterAction('calledAfter')}
                    children={'CalledAfter: ' + calledAftersSize}
                ></Button>
                <Button onClick={() => filterAction('constant')} children={'Constants: ' + constantsSize}></Button>
                <Button
                    onClick={() => filterAction('description')}
                    children={'Descriptions: ' + descriptionSize}
                ></Button>
                <Button onClick={() => filterAction('enum')} children={'Enums: ' + enumsSize}></Button>
                <Button onClick={() => filterAction('group')} children={'Groups: ' + groupsSize}></Button>
                <Button onClick={() => filterAction('move')} children={'Move: ' + movesSize}></Button>
                <Button onClick={() => filterAction('optional')} children={'Optionals: ' + optionalsSize}></Button>
                <Button onClick={() => filterAction('pure')} children={'Pures: ' + puresSize}></Button>
                <Button onClick={() => filterAction('remove')} children={'Removes: ' + removesSize}></Button>
                <Button onClick={() => filterAction('rename')} children={'Renaming: ' + renamingsSize}></Button>
                <Button onClick={() => filterAction('required')} children={'Requireds: ' + requiredsSize}></Button>
                <Button onClick={() => filterAction('todo')} children={'Todos: ' + todoSize}></Button>
            </SimpleGrid>
        </>
    );
};

const countNonRepeatableAnnotation = (targetToAnnotation: { [target: string]: Annotation }, matchedIds: string[]) => {
    return Object.keys(targetToAnnotation).filter((it) => matchedIds.includes(it)).length;
};

const countRepeatableAnnotation = (
    targetToNameToAnnotation: { [target: string]: { [name: string]: Annotation } },
    matchedIds: string[],
) => {
    return Object.entries(targetToNameToAnnotation).reduce((acc, [target, nameToAnnotations]) => {
        if (matchedIds.includes(target)) {
            return acc + Object.keys(nameToAnnotations).length;
        } else {
            return acc;
        }
    }, 0);
};
