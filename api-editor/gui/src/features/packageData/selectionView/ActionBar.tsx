import { Button, HStack } from '@chakra-ui/react';
import React from 'react';
import { PythonPackage } from '../model/PythonPackage';
import { PythonDeclaration } from '../model/PythonDeclaration';
import { AbstractPythonFilter } from '../model/filters/AbstractPythonFilter';
import { AnnotationStore, selectAnnotations } from '../../annotations/annotationSlice';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { selectFilter, setAllCollapsedInTreeView, setAllExpandedInTreeView } from '../../ui/uiSlice';
import { selectFilteredPythonPackage, selectFlatSortedDeclarationList } from '../apiSlice';
import { selectUsages } from '../../usages/usageSlice';
import { Optional } from '../../../common/util/types';

interface ActionBarProps {
    declaration: Optional<PythonDeclaration>;
}

export const ActionBar: React.FC<ActionBarProps> = function ({ declaration }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const allDeclarations = useAppSelector(selectFlatSortedDeclarationList);
    const pythonPackage = useAppSelector(selectFilteredPythonPackage);
    const pythonFilter = useAppSelector(selectFilter);
    const annotations = useAppSelector(selectAnnotations);
    const usages = useAppSelector(selectUsages);

    return (
        <HStack borderTop={1} layerStyle="subtleBorder" padding="0.5em 1em" marginTop={0} w="100%">
            <Button
                disabled={!declaration}
                onClick={() => {
                    let navStr = getPreviousElementPath(
                        allDeclarations,
                        declaration!,
                        pythonFilter,
                        annotations,
                        usages,
                    );
                    if (navStr !== null) {
                        //navigate to element
                        navigate(`/${navStr}`);

                        //update tree selection
                        const parents = getAncestors(navStr, pythonPackage);
                        dispatch(setAllExpandedInTreeView(parents));
                    }
                }}
            >
                Previous
            </Button>
            <Button
                disabled={!declaration}
                onClick={() => {
                    let navStr = getNextElementPath(allDeclarations, declaration!, pythonFilter, annotations, usages);
                    if (navStr !== null) {
                        //navigate to element
                        navigate(`/${navStr}`);

                        //update tree selection
                        const parents = getAncestors(navStr, pythonPackage);
                        dispatch(setAllExpandedInTreeView(parents));
                    }
                }}
            >
                Next
            </Button>
            <Button
                accessKey="a"
                onClick={() => {
                    dispatch(setAllExpandedInTreeView(getDescendantsOrSelf(pythonPackage)));
                }}
            >
                Expand All
            </Button>
            <Button
                accessKey="s"
                onClick={() => {
                    dispatch(setAllCollapsedInTreeView(getDescendantsOrSelf(pythonPackage)));
                }}
            >
                Collapse All
            </Button>
            <Button
                accessKey="y"
                disabled={!declaration}
                onClick={() => {
                    dispatch(setAllExpandedInTreeView(getDescendantsOrSelf(declaration!)));
                }}
            >
                Expand Selected
            </Button>
            <Button
                accessKey="x"
                disabled={!declaration}
                onClick={() => {
                    dispatch(setAllCollapsedInTreeView(getDescendantsOrSelf(declaration!)));
                }}
            >
                Collapse Selected
            </Button>
        </HStack>
    );
};

const getNextElementPath = function (
    declarations: PythonDeclaration[],
    start: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): string {
    let current = getNextElementInTree(declarations, start);
    while (current !== start) {
        if (filter.shouldKeepDeclaration(current, annotations, usages)) {
            return current.id;
        }
        current = getNextElementInTree(declarations, current);
    }
    return start.id;
};

const getNextElementInTree = function (
    declarations: PythonDeclaration[],
    current: PythonDeclaration,
): PythonDeclaration {
    if (declarations.length === 0) {
        return current;
    }

    const index = declarations.findIndex((it) => it.id === current.id);
    const nextIndex = (index + 1) % declarations.length;
    return declarations[nextIndex];
};

const getPreviousElementPath = function (
    declarations: PythonDeclaration[],
    start: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): string | null {
    let current = getPreviousElementInTree(declarations, start);
    while (current !== start && current !== null) {
        if (filter.shouldKeepDeclaration(current, annotations, usages)) {
            return current.id;
        }
        current = getPreviousElementInTree(declarations, current);
    }
    return null;
};

const getPreviousElementInTree = function (
    declarations: PythonDeclaration[],
    current: PythonDeclaration,
): PythonDeclaration {
    if (declarations.length === 0) {
        return current;
    }

    const index = declarations.findIndex((it) => it.id === current.id);
    const previousIndex = (index - 1 + declarations.length) % declarations.length;
    return declarations[previousIndex];
};

const getAncestors = function (navStr: string, filteredPythonPackage: PythonPackage): string[] {
    const ancestors: string[] = [];

    let currentElement = filteredPythonPackage.getDeclarationById(navStr);
    if (currentElement) {
        currentElement = currentElement.parent();
        while (currentElement) {
            ancestors.push(currentElement.id);
            currentElement = currentElement.parent();
        }
    }

    return ancestors;
};

const getDescendantsOrSelf = function (current: PythonDeclaration): string[] {
    return [...current.descendantsOrSelf()].map((descendant) => descendant.id);
};
