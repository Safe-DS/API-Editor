import { Button, HStack, Spacer } from '@chakra-ui/react';
import React from 'react';
import { UsernameInput } from './UsernameInput';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { PythonPackage } from '../packageData/model/PythonPackage';
import { selectFilteredPythonPackage, selectFlatSortedDeclarationList } from '../packageData/apiSlice';
import { Optional } from '../../common/util/types';
import { AbstractPythonFilter } from '../filter/model/AbstractPythonFilter';
import { AnnotationStore, redo, selectAnnotationStore, undo } from '../annotations/annotationSlice';
import { selectFilter, setAllCollapsedInTreeView, setAllExpandedInTreeView } from '../ui/uiSlice';
import { PythonDeclaration } from '../packageData/model/PythonDeclaration';
import { selectUsages } from '../usages/usageSlice';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { useNavigate } from 'react-router';

interface ActionBarProps {
    declaration: Optional<PythonDeclaration>;
}

export const Footer: React.FC<ActionBarProps> = function ({ declaration }) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const allDeclarations = useAppSelector(selectFlatSortedDeclarationList);
    const pythonPackage = useAppSelector(selectFilteredPythonPackage);
    const pythonFilter = useAppSelector(selectFilter);
    const annotations = useAppSelector(selectAnnotationStore);
    const usages = useAppSelector(selectUsages);

    return (
        <HStack borderTop={1} layerStyle="subtleBorder" padding="0.5em 1em" marginTop={0} w="100%">
            <HStack>
                <Button
                    accessKey="p"
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
                    accessKey="n"
                    disabled={!declaration}
                    onClick={() => {
                        let navStr = getNextElementPath(
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
                    Next
                </Button>

                <Button
                    accessKey="u"
                    onClick={() => {
                        const parent = declaration?.parent();
                        if (parent && !(parent instanceof PythonPackage)) {
                            navigate(`/${parent.id}`);
                        }
                    }}
                >
                    Go to Parent
                </Button>

                <Button
                    onClick={() => {
                        dispatch(setAllExpandedInTreeView(getDescendantsOrSelf(pythonPackage)));
                    }}
                >
                    Expand All
                </Button>
                <Button
                    onClick={() => {
                        dispatch(setAllCollapsedInTreeView(getDescendantsOrSelf(pythonPackage)));
                    }}
                >
                    Collapse All
                </Button>

                <Button
                    disabled={!declaration}
                    onClick={() => {
                        dispatch(setAllExpandedInTreeView(getDescendantsOrSelf(declaration!)));
                    }}
                >
                    Expand Selected
                </Button>
                <Button
                    disabled={!declaration}
                    onClick={() => {
                        dispatch(setAllCollapsedInTreeView(getDescendantsOrSelf(declaration!)));
                    }}
                >
                    Collapse Selected
                </Button>
                <Button
                    accessKey="z"
                    disabled={!declaration}
                    onClick={() => {
                        dispatch(undo());
                    }}
                >
                    Undo
                </Button>
                <Button
                    accessKey="y"
                    disabled={!declaration}
                    onClick={() => {
                        dispatch(redo());
                    }}
                >
                    Redo
                </Button>
            </HStack>

            <Spacer />

            <HStack>
                <UsernameInput />
            </HStack>
        </HStack>
    );
};

const getPreviousElementPath = function (
    declarations: PythonDeclaration[],
    start: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): string {
    let currentIndex = getPreviousIndex(declarations, getIndex(declarations, start));
    let current = getElementAtIndex(declarations, currentIndex);
    while (current !== null && current !== start) {
        if (filter.shouldKeepDeclaration(current, annotations, usages)) {
            return current.id;
        }
        currentIndex = getPreviousIndex(declarations, currentIndex);
        current = getElementAtIndex(declarations, currentIndex);
    }
    return start.id;
};

const getNextElementPath = function (
    declarations: PythonDeclaration[],
    start: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): string {
    let currentIndex = getNextIndex(declarations, getIndex(declarations, start));
    let current = getElementAtIndex(declarations, currentIndex);
    while (current !== null && current !== start) {
        if (filter.shouldKeepDeclaration(current, annotations, usages)) {
            return current.id;
        }
        currentIndex = getNextIndex(declarations, currentIndex);
        current = getElementAtIndex(declarations, currentIndex);
    }
    return start.id;
};

const getPreviousIndex = function (declarations: PythonDeclaration[], currentIndex: number | null): number | null {
    if (currentIndex === null || currentIndex < 0 || currentIndex >= declarations.length) {
        return null;
    }

    return (currentIndex - 1 + declarations.length) % declarations.length;
};

const getNextIndex = function (declarations: PythonDeclaration[], currentIndex: number | null): number | null {
    if (currentIndex === null || currentIndex < 0 || currentIndex >= declarations.length) {
        return null;
    }

    return (currentIndex + 1) % declarations.length;
};

const getIndex = function (declarations: PythonDeclaration[], current: PythonDeclaration): number | null {
    const index = declarations.findIndex((it) => it.id === current.id);
    if (index === -1) {
        return null;
    }
    return index;
};

const getElementAtIndex = function (declarations: PythonDeclaration[], index: number | null): PythonDeclaration | null {
    if (index === null) {
        return null;
    }
    return declarations[index];
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
