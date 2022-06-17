import { Button, Heading, VStack, Wrap, WrapItem } from '@chakra-ui/react';
import React from 'react';
import { selectAnnotations } from '../../annotations/annotationSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectFilterString, setFilterString } from '../../ui/uiSlice';

export const StatisticsView: React.FC = function () {
    const annotations = useAppSelector(selectAnnotations);
    const filterString = useAppSelector(selectFilterString);
    const dispatch = useAppDispatch();

    const boundariesSize = Object.keys(annotations.boundaries).length;
    const constantsSize = Object.keys(annotations.constants).length;
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
        <VStack spacing={4}>
            <Heading as="h2" size="md">
                Statistics
            </Heading>
            <Heading as="h3" size="md">
                Annotations
            </Heading>
            <Wrap mx="auto" padding="10px 10px 10px 10px">
                <WrapItem>
                    <Button
                        onClick={() => filterAction('attribute')}
                        children={'Attributes: ' + attributesSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('boundary')}
                        children={'Boundaries: ' + boundariesSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button
                        onClick={() => filterAction('calledAfter')}
                        children={'CalledAfter: ' + calledAftersSize}
                    ></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('constant')} children={'Constants: ' + constantsSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('enum')} children={'Enums: ' + enumsSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('group')} children={'Groups: ' + groupsSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('move')} children={'Move: ' + movesSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('optional')} children={'Optionals: ' + optionalsSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('pure')} children={'Pures: ' + puresSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('remove')} children={'Removes: ' + removesSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('rename')} children={'Renaming: ' + renamingsSize}></Button>
                </WrapItem>
                <WrapItem>
                    <Button onClick={() => filterAction('required')} children={'Requireds: ' + requiredsSize}></Button>
                </WrapItem>
            </Wrap>
        </VStack>
    );
};
