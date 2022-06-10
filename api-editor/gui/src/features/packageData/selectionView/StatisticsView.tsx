import {Heading, Button, Stack} from '@chakra-ui/react';
import React from 'react';
import {useAppSelector} from "../../../app/hooks";
import AnnotationSlice, {
    selectAnnotations,
    selectAttribute,
    Annotation,
    AnnotationsState
} from "../../annotations/annotationSlice";
import PythonParameter from "../model/PythonParameter";

interface StatistiscViewProps {
    annotations: AnnotationsState;
}

const StatisticsView: React.FC<StatistiscViewProps> = function ({
}) {
    const annotations = useAppSelector(selectAnnotations);
    let dict = {};
    for (let property in annotations){
        console.log("property: " + property.toString() + " "+Object.getOwnPropertyNames(property))
        if (Array.isArray(property) && property.length >0){
            //TODO CalledAfterAnnotation and GroupAnnotation
        }
    }
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

    return (
        <Stack>
            <Heading as="h4" size="md">Statistics</Heading>
            <Button onClick={() => console.log("test")} children ={"Test: " + movesSize}></Button>

        </Stack>
    );
};

export default StatisticsView;
