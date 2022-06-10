import {Heading, Button, VStack, Wrap, WrapItem, Stack} from '@chakra-ui/react';
import React from 'react';
import {useAppSelector} from "../../../app/hooks";
import {
    selectAnnotations,
    selectAttribute,
    AnnotationsState
} from "../../annotations/annotationSlice";
import PythonParameter from "../model/PythonParameter";
import AbstractPythonFilter from "../model/filters/AbstractPythonFilter";
import PythonPackage from "../model/PythonPackage";
import {UsageCountStore} from "../../usages/model/UsageCountStore";
import {createFilterFromString} from "../model/filters/filterFactory";
import {Setter} from "../../../common/util/types";

interface StatisticsViewProps {
    annotations: AnnotationsState;
    filter: string;
    setFilter: Setter<string>;
}

const StatisticsView: React.FC<StatisticsViewProps> = function ({
                                                                    annotations, filter, setFilter
                                                                }) {

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

    function filterAction(annotation: string) {
        let annotationFilter = "annotation:@";
        const filter_string = annotationFilter + annotation;

        //Remove existing annotation filter
        const filterList = filter.split(" ");
        let newFilter = "";
        for (let i = 0; i < filterList.length; i++) {
            if (!filterList[i].startsWith(annotationFilter)) {
                newFilter += filterList[i];
                newFilter += " ";
            }
        }

        newFilter += filter_string;
        setFilter(newFilter);
    }

    return (
        <VStack spacing={4}>
            <Heading as="h2" size="md">Statistics</Heading>
            <Wrap>
                <WrapItem><Button onClick={() => filterAction('attribute')}
                                  children={"Attributes: " + attributesSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('boundary')}
                                  children={"Boundaries: " + boundariesSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('calledAfter')}
                                  children={"CalledAfter: " + calledAftersSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('constant')}
                                  children={"Constants: " + constantsSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('enum')}
                                  children={"Enums: " + enumsSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('group')}
                                  children={"Groups: " + groupsSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('move')}
                                  children={"Move: " + movesSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('optional')}
                                  children={"Optionals: " + optionalsSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('pure')}
                                  children={"Pures: " + puresSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('remove')} children={"Removes: " + removesSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('rename')}
                                  children={"Renaming: " + renamingsSize}></Button></WrapItem>
                <WrapItem><Button onClick={() => filterAction('required')}
                                  children={"Requireds: " + requiredsSize}></Button></WrapItem>
            </Wrap>
        </VStack>
    );
};

export default StatisticsView;
