import {Heading, Button, Stack} from '@chakra-ui/react';
import React from 'react';
import {useAppSelector} from "../../../app/hooks";
import {selectAnnotations, selectAttribute, Annotation} from "../../annotations/annotationSlice";

const StatisticsView: React.FC = function ({
}) {
    const annotations = useAppSelector(selectAnnotations);
    let dict = {};
    for (const property in annotations){
        if (Array.isArray(property) && property.length >0){
            console.log("property: " + property.toString() + " "+Object.getOwnPropertyNames(property))
            //TODO CalledAfterAnnotation and GroupAnnotation
        }
    }
    const boundariesSize = annotations.boundaries.length;
    const constantsSize = annotations.constants.length;
    const enumsSize = annotations.enums.length;
    const optionalsSize = annotations.optionals.length;
    const movesSize = annotations.moves.length;
    const groupsSize = annotations.groups.length;
    const calledAftersSize = annotations.calledAfters.length;
    const attributesSize = annotations.attributes.length;
    const puresSize = annotations.pures.length;
    const renamingsSize = annotations.renamings.length;
    const requiredsSize = annotations.requireds.length;
    const removesSize = annotations.removes.length;
    /*

pures
renamings
requireds
removes
     */

    return (
        <Stack>
            <Heading as="h4" size="md">Statistics</Heading>
            <Button onClick={() => console.log("test")} children ={"Test: " + movesSize}></Button>

        </Stack>
    );
};

export default StatisticsView;
