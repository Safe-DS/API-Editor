import {Box, Button, HStack, Spacer, VStack} from '@chakra-ui/react';
import React from 'react';
import {useCallback, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router';
import PythonClass from '../model/PythonClass';
import PythonFunction from '../model/PythonFunction';
import PythonModule from '../model/PythonModule';
import PythonPackage from '../model/PythonPackage';
import PythonParameter from '../model/PythonParameter';
import ClassView from './ClassView';
import FunctionView from './FunctionView';
import ModuleView from './ModuleView';
import ParameterView from './ParameterView';
import {expandParentsInTreeView, collapseAllParents, expandAllParents} from '../packageDataSlice';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import PythonDeclaration from '../model/PythonDeclaration';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import {AnnotationsState, selectAnnotations} from '../../annotations/annotationSlice';

interface SelectionViewProps {
    pythonPackage: PythonPackage;
    pythonFilter: AbstractPythonFilter;
}

const SelectionView: React.FC<SelectionViewProps> = function ({pythonPackage, pythonFilter}) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const declaration = pythonPackage.getByRelativePath(useLocation().pathname.split('/').splice(2));
    const annotations = useAppSelector(selectAnnotations);

    if (!declaration) {
        return <></>;
    }
    // const handleKeyPress = useCallback((event) => {
    //     if (event.ctrlKey) {
    //         console.log("Gustav");
    //         if (event.key == 'ö') {
    //             console.log('lög');
    //             dispatch(expandAllParents(getAllParents(pythonPackage)));
    //         }
    //     }
    // }, []);
    // useEffect(() => {
    //     // attach the event listener
    //     document.addEventListener('keydown', handleKeyPress);
    //
    //     // remove the event listener
    //     return () => {
    //         document.removeEventListener('keydown', handleKeyPress);
    //     };
    // }, [handleKeyPress]);
    //     // dispatch(expandParentsInTreeView(parents));
    //     // dispatch(expandAllParents(getAllParents(pythonPackage)));
    //     // dispatch(collapseAllParents(getAllParents(pythonPackage)));


    return (
        <VStack h="100%">
            <Box w="100%" flexGrow={1} overflowY="scroll">
                <Box padding={4}>
                    {declaration instanceof PythonFunction && <FunctionView pythonFunction={declaration}/>}
                    {declaration instanceof PythonClass && <ClassView pythonClass={declaration}/>}
                    {declaration instanceof PythonModule && <ModuleView pythonModule={declaration}/>}
                    {declaration instanceof PythonParameter && <ParameterView pythonParameter={declaration}/>}
                </Box>
            </Box>

            <Spacer/>

            <HStack borderTop={1} layerStyle="subtleBorder" padding="0.5em 1em" w="100%">
                <Button
                    onClick={() => {
                        let navStr = getPreviousElementPath(declaration, pythonFilter, annotations);
                        if (navStr != null) {
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
                        let navStr = getNextElementPath(declaration, pythonFilter, annotations);
                        if (navStr != null) {
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
                <Button accessKey="n"
                    onClick={() => {
                        dispatch(expandAllParents(getAllParents(pythonPackage)));
                    }
                    }
                >
                    Expand All
                </Button>
                <Button accessKey="a"
                    onClick={() => {
                        dispatch(collapseAllParents(getAllParents(pythonPackage)));
                    }
                    }
                >
                    Collapse All
                </Button>
                <Button accessKey="b"
                    onClick={() => {
                        dispatch(collapseAllParents(getChildrenOfElementInTree(declaration)));
                    }
                    }
                >
                    Collapse Selected
                </Button>
                <Button accessKey="m"
                    onClick={() => {
                        dispatch(expandAllParents(getChildrenOfElementInTree(declaration)));
                    }
                    }
                >
                    Expand Selected
                </Button>
            </HStack>
        </VStack>
    );
};

const getNextElementPath = function (
    current: PythonDeclaration,
    filter: AbstractPythonFilter,
    annotations: AnnotationsState,
): string | null {
    const nextElement = getNextElementInTree(current);
    if (nextElement != null) {
        if (filter.shouldKeepDeclaration(nextElement, annotations)) {
            return nextElement.pathAsString();
        }
        return getNextElementPath(nextElement, filter, annotations);
    }
    return null;
};

const getNextElementInTree = function (current: PythonDeclaration): PythonDeclaration | null {
    if (current.children().length > 0) {
        return current.children()[0];
    } else if (current.parent() != null) {
        return getNextFromParentInTree(current);
    }
    return null;
};

const getNextFromParentInTree = function (current: PythonDeclaration): PythonDeclaration | null {
    if (current instanceof PythonPackage && current.children().length > 0) {
        return current.children()[0];
    }
    const parent = current.parent();
    if (parent != null) {
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
): string | null {
    const previousElement = getPreviousElementInTree(current);
    if (previousElement != null) {
        if (filter.shouldKeepDeclaration(previousElement, annotations)) {
            return previousElement.pathAsString();
        }
        return getPreviousElementPath(previousElement, filter, annotations);
    }
    return null;
};

const getPreviousElementInTree = function (current: PythonDeclaration): PythonDeclaration | null {
    const parent = current.parent();
    if (parent != null) {
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
    if (currentElement != null) {
        currentElement = currentElement.parent();
        while (currentElement != null) {
            parents.push(currentElement.pathAsString());
            currentElement = currentElement.parent();
        }
    }
    return parents;
};

const getAllParents = function (filteredPythonPackage: PythonPackage): string[] {
    const parents: string[] = [];
    let allElements = filteredPythonPackage.children();
    for (const element of allElements) {
        parents.push(element.pathAsString());
        for (const object of element.children()) {
            if (object instanceof PythonClass) {
                parents.push(object.pathAsString());
                for (const method of object.methods){
                    parents.push(method.pathAsString());
                }
            } else if (object instanceof PythonFunction) {
                parents.push(object.pathAsString());
            }
        }
    }
    return parents;
};

const getChildrenOfElementInTree = function (current: PythonDeclaration): string[] {
    let childrenList: string[] = [current.pathAsString()];
    let children = current.children();
    for (const child of children){
        const list = getChildrenOfElementInTree(child);
        childrenList = [...childrenList, ...list];
    }
    return childrenList;
};

export default SelectionView;
