import React from 'react';
import { Button, Heading, SimpleGrid } from '@chakra-ui/react';
import { selectAnnotationStore } from '../annotations/annotationSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectFilterString, setFilterString } from '../ui/uiSlice';

export const AnnotationStatistics = function () {
    const dispatch = useAppDispatch();

    const annotations = useAppSelector(selectAnnotationStore);
    const boundariesSize = Object.keys(annotations.boundaries).length;
    const constantsSize = Object.keys(annotations.constants).length;
    const descriptionSize = Object.keys(annotations.descriptions).length;
    const enumsSize = Object.keys(annotations.enums).length;
    const optionalsSize = Object.keys(annotations.optionals).length;
    const movesSize = Object.keys(annotations.moves).length;
    const groupsSize = Object.keys(annotations.groups).length;
    const calledAftersSize = Object.keys(annotations.calledAfters).length;
    const attributesSize = Object.keys(annotations.attributes).length;
    const puresSize = Object.keys(annotations.pures).length;
    const renamingsSize = Object.keys(annotations.renamings).length;
    const requiredsSize = Object.keys(annotations.requireds).length;
    const removesSize = Object.keys(annotations.removes).length;
    const todoSize = Object.keys(annotations.todos).length;

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
                Annotations
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
