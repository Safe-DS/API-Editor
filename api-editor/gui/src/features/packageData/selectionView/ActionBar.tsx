import { Button, HStack } from '@chakra-ui/react';
import React from 'react';
import { PythonPackage } from '../model/PythonPackage';
import { PythonDeclaration } from '../model/PythonDeclaration';
import { AbstractPythonFilter } from '../model/filters/AbstractPythonFilter';
import { AnnotationStore, selectAnnotations } from '../../annotations/annotationSlice';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { setAllCollapsedInTreeView, setAllExpandedInTreeView, setExactlyExpandedInTreeView } from '../../ui/uiSlice';

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
    current: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
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
    annotations: AnnotationStore,
    usages: UsageCountStore,
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

const getAncestors = function (navStr: string, filteredPythonPackage: PythonPackage): string[] {
    const ancestors: string[] = [];
    let currentElement = filteredPythonPackage.getByRelativePathAsString(navStr);
    if (currentElement) {
        currentElement = currentElement.parent();
        while (currentElement) {
            ancestors.push(currentElement.pathAsString());
            currentElement = currentElement.parent();
        }
    }
    return ancestors;
};

const getDescendantsOrSelf = function (current: PythonDeclaration): string[] {
    return [...current.descendantsOrSelf()].map((descendant) => descendant.pathAsString());
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
        nodesToExpand.push(current.pathAsString());
    }

    return {
        nodesToExpand,
        subtreeShouldBeExpanded: isMatched(current) || shouldExpandThisNode,
    };
};
