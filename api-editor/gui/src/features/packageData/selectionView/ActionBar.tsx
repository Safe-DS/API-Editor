import { Button, HStack } from '@chakra-ui/react';
import React from 'react';
import { PythonPackage } from '../model/PythonPackage';
import { PythonDeclaration } from '../model/PythonDeclaration';
import { AbstractPythonFilter } from '../model/filters/AbstractPythonFilter';
import { AnnotationStore, selectAnnotations } from '../../annotations/annotationSlice';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import {
    selectFilter,
    setAllCollapsedInTreeView,
    setAllExpandedInTreeView,
    setExactlyExpandedInTreeView,
} from '../../ui/uiSlice';
import { selectFilteredPythonPackage } from '../apiSlice';
import { selectUsages } from '../../usages/usageSlice';

interface ActionBarProps {
    declaration: PythonDeclaration;
}

export const ActionBar: React.FC<ActionBarProps> = function ({ declaration }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const pythonPackage = useAppSelector(selectFilteredPythonPackage);
    const pythonFilter = useAppSelector(selectFilter);
    const annotations = useAppSelector(selectAnnotations);
    const usages = useAppSelector(selectUsages);
    const isMatched = (node: PythonDeclaration): boolean =>
        pythonFilter.shouldKeepDeclaration(node, annotations, usages);

    return (
        <HStack borderTop={1} layerStyle="subtleBorder" padding="0.5em 1em" marginTop={0} w="100%">
            <Button
                onClick={() => {
                    let navStr = getPreviousElementPath(declaration, pythonFilter, annotations, usages);
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
                onClick={() => {
                    let navStr = getNextElementPath(declaration, pythonFilter, annotations, usages);
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
                onClick={() => {
                    dispatch(setAllExpandedInTreeView(getDescendantsOrSelf(declaration)));
                }}
            >
                Expand Selected
            </Button>
            <Button
                accessKey="x"
                onClick={() => {
                    dispatch(setAllCollapsedInTreeView(getDescendantsOrSelf(declaration)));
                }}
            >
                Collapse Selected
            </Button>
            <Button
                accessKey="m"
                onClick={() => {
                    dispatch(setExactlyExpandedInTreeView(getMatchedNodesAndParents(pythonPackage, isMatched)));
                }}
            >
                Expand Matched
            </Button>
        </HStack>
    );
};

const getNextElementPath = function (
    start: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): string | null {
    let current = getNextElementInTree(start);
    while (current !== start && current !== null) {
        if (filter.shouldKeepDeclaration(current, annotations, usages)) {
            return current.id;
        }
        current = getNextElementInTree(current);
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
    start: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): string | null {
    let current = getPreviousElementInTree(start);
    while (current !== start && current !== null) {
        if (filter.shouldKeepDeclaration(current, annotations, usages)) {
            return current.id;
        }
        current = getPreviousElementInTree(current);
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

const getMatchedNodesAndParents = function (
    pythonPackage: PythonPackage,
    isMatched: (declaration: PythonDeclaration) => boolean,
): string[] {
    return doGetMatchedNodesAndParents(pythonPackage, isMatched).nodesToExpand;
};

interface DoGetMatchedNodesAndParentsResult {
    nodesToExpand: string[];
    subtreeShouldBeExpanded: boolean;
}

const doGetMatchedNodesAndParents = function (
    current: PythonDeclaration,
    isMatched: (declaration: PythonDeclaration) => boolean,
): DoGetMatchedNodesAndParentsResult {
    const nodesToExpand: string[] = [];
    let shouldExpandThisNode = false;

    for (const child of current.children()) {
        const { nodesToExpand: childrenNodesToExpand, subtreeShouldBeExpanded } = doGetMatchedNodesAndParents(
            child,
            isMatched,
        );

        nodesToExpand.push(...childrenNodesToExpand);
        shouldExpandThisNode ||= subtreeShouldBeExpanded;
    }

    if (shouldExpandThisNode) {
        nodesToExpand.push(current.id);
    }

    return {
        nodesToExpand,
        subtreeShouldBeExpanded: isMatched(current) || shouldExpandThisNode,
    };
};
