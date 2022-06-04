import { Button, HStack } from '@chakra-ui/react';
import React from 'react';
import PythonPackage from '../model/PythonPackage';
import { collapseAllParents, expandAllParents, expandParentsInTreeView } from '../packageDataSlice';
import PythonDeclaration from '../model/PythonDeclaration';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { AnnotationsState, selectAnnotations } from '../../annotations/annotationSlice';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {UsageCountStore} from "../../usages/model/UsageCountStore";

interface ActionBarProps {
    declaration: PythonDeclaration;
    pythonPackage: PythonPackage;
    pythonFilter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const ActionBar: React.FC<ActionBarProps> = function ({ declaration, pythonPackage, pythonFilter, usages }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const annotations = useAppSelector(selectAnnotations);

    return (
        <HStack borderTop={1} layerStyle="subtleBorder" padding="0.5em 1em" w="100%">
            <Button
                onClick={() => {
                    let navStr = getPreviousElementPath(declaration, pythonFilter, annotations, usages);
                    if (navStr !== null) {
                        //navigate to element
                        navigate(`/${navStr}`);

                        //update tree selection
                        const parents = getParents(navStr, pythonPackage);
                        dispatch(expandParentsInTreeView(parents));
                    }
                }}
            >
                Previous
            </Button>
            <Button
                onClick={() => {
                    let navStr = getNextElementPath(declaration, pythonFilter, annotations, usages);
                    if (navStr !== null) {
                        //navigate to element
                        navigate(`/${navStr}`);

                        //update tree selection
                        const parents = getParents(navStr, pythonPackage);
                        dispatch(expandParentsInTreeView(parents));
                    }
                }}
            >
                Next
            </Button>
            <Button
                accessKey="a"
                onClick={() => {
                    dispatch(expandAllParents(getDescendants(pythonPackage)));
                }}
            >
                Expand All
            </Button>
            <Button
                accessKey="s"
                onClick={() => {
                    dispatch(collapseAllParents(getDescendants(pythonPackage)));
                }}
            >
                Collapse All
            </Button>
            <Button
                accessKey="y"
                onClick={() => {
                    dispatch(expandAllParents(getDescendants(declaration)));
                }}
            >
                Expand Selected
            </Button>
            <Button
                accessKey="x"
                onClick={() => {
                    dispatch(collapseAllParents(getDescendants(declaration)));
                }}
            >
                Collapse Selected
            </Button>
        </HStack>
    );
};

const getNextElementPath = function (
    current: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationsState,
    usages: UsageCountStore
): string | null {
    const nextElement = getNextElementInTree(current);
    if (nextElement) {
        if (filter.shouldKeepDeclaration(nextElement, annotations, usages)) {
            return nextElement.pathAsString();
        }
        return getNextElementPath(nextElement, filter, annotations, usages);
    }
    return null;
};

const getNextElementInTree = function (current: PythonDeclaration): PythonDeclaration | null {
    if (current.children().length > 0) {
        return current.children()[0];
    } else if (current.parent()) {
        return getNextFromParentInTree(current);
    }
    return null;
};

const getNextFromParentInTree = function (current: PythonDeclaration): PythonDeclaration | null {
    if (current instanceof PythonPackage && current.children().length > 0) {
        return current.children()[0];
    }
    const parent = current.parent();
    if (parent) {
        const index = parent.children().indexOf(current);
        if (parent.children().length > index + 1) {
            return parent.children()[index + 1];
        }
        return getNextFromParentInTree(parent);
    }
    return null;
};

const getPreviousElementPath = function (
    current: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationsState,
    usages: UsageCountStore
): string | null {
    const previousElement = getPreviousElementInTree(current);
    if (previousElement) {
        if (filter.shouldKeepDeclaration(previousElement, annotations, usages)) {
            return previousElement.pathAsString();
        }
        return getPreviousElementPath(previousElement, filter, annotations, usages);
    }
    return null;
};

const getPreviousElementInTree = function (current: PythonDeclaration): PythonDeclaration | null {
    const parent = current.parent();
    if (parent) {
        const index = parent.children().indexOf(current);
        if (index > 0) {
            return getLastElementInTree(parent.children()[index - 1]);
        }
        if (parent instanceof PythonPackage) {
            return getLastElementInTree(parent);
        }
        return parent;
    }
    return null;
};

const getLastElementInTree = function (current: PythonDeclaration): PythonDeclaration {
    if (current.children().length > 0) {
        return getLastElementInTree(current.children()[current.children().length - 1]);
    }
    return current;
};

const getParents = function (navStr: string, filteredPythonPackage: PythonPackage): string[] {
    const parents: string[] = [];
    let currentElement = filteredPythonPackage.getByRelativePathAsString(navStr);
    if (currentElement) {
        currentElement = currentElement.parent();
        while (currentElement) {
            parents.push(currentElement.pathAsString());
            currentElement = currentElement.parent();
        }
    }
    return parents;
};

const getDescendants = function (current: PythonDeclaration): string[] {
    let childrenList: string[] = [current.pathAsString()];
    let children = current.children();
    for (const child of children) {
        const list = getDescendants(child);
        childrenList = [...childrenList, ...list];
    }
    return childrenList;
};
