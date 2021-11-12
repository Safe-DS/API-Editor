import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Center,
    Flex,
    Heading,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spacer,
    Text as ChakraText,
    useColorMode,
    VStack,
} from '@chakra-ui/react';
import * as idb from 'idb-keyval';
import React, { useEffect, useRef, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
    resetAnnotations,
    toggleAnnotationImportDialog,
} from '../features/annotations/annotationSlice';
import {
    InferableAnnotation,
    InferableAttributeAnnotation,
    InferableBoundaryAnnotation,
    InferableCalledAfterAnnotation,
    InferableConstantAnnotation,
    InferableEnumAnnotation,
    InferableGroupAnnotation,
    InferableMoveAnnotation,
    InferableOptionalAnnotation,
    InferableRenameAnnotation,
    InferableRequiredAnnotation,
    InferableUnusedAnnotation,
} from '../features/InferableDataModel/InferableAnnotation';
import InferablePythonClass from '../features/InferableDataModel/InferablePythonClass';
import InferablePythonFunction from '../features/InferableDataModel/InferablePythonFunction';
import InferablePythonModule from '../features/InferableDataModel/InferablePythonModule';
import InferablePythonPackage from '../features/InferableDataModel/InferablePythonPackage';
import InferablePythonParameter from '../features/InferableDataModel/InferablePythonParameter';
import InferablePythonResult from '../features/InferableDataModel/InferablePythonResult';
import PythonClass from '../features/packageData/model/PythonClass';
import { PythonFilter } from '../features/packageData/model/PythonFilter';
import PythonFunction from '../features/packageData/model/PythonFunction';
import PythonModule from '../features/packageData/model/PythonModule';
import PythonPackage from '../features/packageData/model/PythonPackage';
import {
    parsePythonPackageJson,
    PythonPackageJson,
} from '../features/packageData/model/PythonPackageBuilder';
import PythonParameter from '../features/packageData/model/PythonParameter';
import PythonResult from '../features/packageData/model/PythonResult';
import { togglePackageDataImportDialog } from '../features/packageData/packageDataSlice';
import { Setter } from './util/types';

interface MenuBarProps {
    filter: string;
    setFilter: Setter<string>;
}

const DeleteAllAnnotations = function () {
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const cancelRef = useRef(null);

    // Event handlers ----------------------------------------------------------

    const handleConfirm = () => {
        dispatch(resetAnnotations());
        setIsOpen(false);
    };
    const handleCancel = () => setIsOpen(false);

    // Render ------------------------------------------------------------------

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                Delete all annotations
            </Button>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={handleCancel}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Heading>Delete all annotations</Heading>
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack alignItems="flexStart">
                                <ChakraText>
                                    Are you sure? You can't undo this action
                                    afterwards.
                                </ChakraText>
                                <ChakraText>
                                    Hint: Consider exporting your work first by
                                    clicking on the "Export" button in the menu
                                    bar.
                                </ChakraText>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleConfirm}
                                ml={3}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

const MenuBar: React.FC<MenuBarProps> = function ({ filter, setFilter }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const initialFocusRef = useRef(null);
    const dispatch = useAppDispatch();

    const pathname = useLocation().pathname.split('/').slice(1);

    const annotationStore = useAppSelector((state) => state.annotations);
    const enableNavigation = useAppSelector(
        (state) => state.annotations.currentUserAction.type === 'none',
    );

    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(
        new PythonPackage('empty', 'empty', '0.0.1'),
    );

    const exportAnnotations = () => {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(annotationStore)], {
            type: 'application/json',
        });
        a.href = URL.createObjectURL(file);
        a.download = 'annotations.json';
        a.click();
    };

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getPythonPackageFromIndexedDB(setPythonPackage);
    }, []);

    const getPythonPackageFromIndexedDB = async function (
        setPythonPackage: Setter<PythonPackage>,
    ) {
        const storedPackage = (await idb.get('package')) as PythonPackageJson;
        if (storedPackage) {
            setPythonPackage(parsePythonPackageJson(storedPackage));
        }
    };

    const possibleAnnotations = [
        'Attribute',
        'Boundary',
        'CalledAfters',
        'Constant',
        'Enum',
        'Groups',
        'Move',
        'Optional',
        'Rename',
        'Required',
        'Unused',
    ];

    const getExistingAnnotations = (target: string): InferableAnnotation[] => {
        let targetAnnotations: InferableAnnotation[] = [];
        possibleAnnotations.forEach((annotation) => {
            const returnedAnnotations = returnFormattedAnnotation(
                target,
                annotation,
            );
            if (returnedAnnotations) {
                targetAnnotations.concat(returnedAnnotations);
            }
        });
        return targetAnnotations;
    };

    const returnFormattedAnnotation = (
        target: string,
        annotationType: string,
    ): InferableAnnotation[] | InferableAnnotation | undefined => {
        switch (annotationType) {
            case 'Attribute':
                const attributeAnnotation = annotationStore.attributes[target];
                if (attributeAnnotation) {
                    return new InferableAttributeAnnotation(
                        attributeAnnotation,
                    );
                }
                break;
            case 'Boundary':
                const boundaryAnnotation = annotationStore.boundaries[target];
                if (boundaryAnnotation) {
                    return new InferableBoundaryAnnotation(boundaryAnnotation);
                }
                break;
            case 'CalledAfters':
                const calledAfterAnnotations =
                    annotationStore.calledAfters[target];
                if (!calledAfterAnnotations) {
                    break;
                }
                const calledAfterAnnotationList = Object.values(
                    calledAfterAnnotations,
                );
                if (calledAfterAnnotationList.length === 1) {
                    return new InferableCalledAfterAnnotation(
                        calledAfterAnnotationList[0],
                    );
                }
                let inferableCalledAfterAnnotations: InferableCalledAfterAnnotation[] =
                    [];
                calledAfterAnnotationList.forEach((calledAfterAnnotation) => {
                    inferableCalledAfterAnnotations.push(
                        new InferableCalledAfterAnnotation(
                            calledAfterAnnotation,
                        ),
                    );
                });
                return inferableCalledAfterAnnotations;
            case 'Constant':
                const constantAnnotation = annotationStore.constants[target];
                if (constantAnnotation) {
                    return new InferableConstantAnnotation(constantAnnotation);
                }
                break;
            case 'Groups':
                const groupAnnotations = annotationStore.groups[target];
                if (!groupAnnotations) {
                    break;
                }
                const groupAnnotationList = Object.values(groupAnnotations);
                if (groupAnnotationList.length === 1) {
                    return new InferableGroupAnnotation(groupAnnotationList[0]);
                }
                let inferableGroupAnnotations: InferableGroupAnnotation[] = [];
                groupAnnotationList.forEach((groupAnnotation) => {
                    inferableGroupAnnotations.push(
                        new InferableGroupAnnotation(groupAnnotation),
                    );
                });
                return inferableGroupAnnotations;
            case 'Enum':
                const enumAnnotation = annotationStore.enums[target];
                if (enumAnnotation) {
                    return new InferableEnumAnnotation(enumAnnotation);
                }
                break;
            case 'Move':
                const moveAnnotation = annotationStore.moves[target];
                if (moveAnnotation) {
                    return new InferableMoveAnnotation(moveAnnotation);
                }
                break;
            case 'Optional':
                const optionalAnnotation = annotationStore.optionals[target];
                if (optionalAnnotation) {
                    return new InferableOptionalAnnotation(optionalAnnotation);
                }
                break;
            case 'Rename':
                const renameAnnotation = annotationStore.renamings[target];
                if (renameAnnotation) {
                    return new InferableRenameAnnotation(renameAnnotation);
                }
                break;
            case 'Required':
                const requiredAnnotation = annotationStore.requireds[target];
                if (requiredAnnotation) {
                    return new InferableRequiredAnnotation();
                }
                break;
            case 'Unused':
                const unusedAnnotation = annotationStore.unuseds[target];
                if (unusedAnnotation) {
                    return new InferableUnusedAnnotation();
                }
                break;
        }
        return undefined;
    };

    const buildInferablePackage = (pythonPackage: PythonPackage) => {
        const inferablePackage: InferablePythonPackage = {
            name: pythonPackage.name,
            distribution: pythonPackage.distribution,
            version: pythonPackage.version,
            annotations: getExistingAnnotations(pythonPackage.pathAsString()),
            modules: buildInferableModules(pythonPackage.modules),
        };
        return inferablePackage;
    };

    const buildInferableClasses = (pythonModule: PythonModule) => {
        let pythonClasses: InferablePythonClass[] = [];
        pythonModule.classes.forEach((pythonClass: PythonClass) => {
            pythonClasses.push({
                name: pythonClass.name,
                qualifiedName: pythonClass.qualifiedName,
                decorators: pythonClass.decorators,
                superclasses: pythonClass.superclasses,
                description: pythonClass.description,
                fullDocstring: pythonClass.fullDocstring,
                methods: buildInferableFunctions(pythonClass),
                annotations: getExistingAnnotations(pythonClass.pathAsString()),
            });
        });
        return pythonClasses;
    };

    const buildInferableFunctions = (
        pythonDeclaration: PythonModule | PythonClass,
    ) => {
        let pythonFunctions: InferablePythonFunction[] = [];
        if (pythonDeclaration instanceof PythonModule) {
            pythonDeclaration.functions.forEach(
                (pythonFunction: PythonFunction) => {
                    pythonFunctions.push(
                        buildInferableFunction(pythonFunction),
                    );
                },
            );
        }
        if (pythonDeclaration instanceof PythonClass) {
            pythonDeclaration.methods.forEach(
                (pythonFunction: PythonFunction) => {
                    pythonFunctions.push(
                        buildInferableFunction(pythonFunction),
                    );
                },
            );
        }
        return pythonFunctions;
    };

    const buildInferableFunction = (pythonFunction: PythonFunction) => {
        return new InferablePythonFunction(
            pythonFunction.name,
            pythonFunction.qualifiedName,
            pythonFunction.decorators,
            buildInferableParameters(pythonFunction.parameters),
            buildInferablePythonResults(pythonFunction.results),
            pythonFunction.isPublic,
            pythonFunction.description,
            pythonFunction.fullDocstring,
            getExistingAnnotations(pythonFunction.pathAsString()),
        );
    };

    const buildInferablePythonResults = (pythonResults: PythonResult[]) => {
        let inferablePythonResults: InferablePythonResult[] = [];
        pythonResults.forEach((pythonResult: PythonResult) => {
            inferablePythonResults.push(
                new InferablePythonResult(
                    pythonResult.name,
                    pythonResult.type,
                    pythonResult.typeInDocs,
                    pythonResult.description,
                    getExistingAnnotations(pythonResult.pathAsString()),
                ),
            );
        });
        return inferablePythonResults;
    };

    const buildInferableParameters = (pythonParameters: PythonParameter[]) => {
        let inferablePythonParameters: InferablePythonParameter[] = [];
        pythonParameters.forEach((pythonParameter: PythonParameter) => {
            inferablePythonParameters.push(
                new InferablePythonParameter(
                    pythonParameter.name,
                    pythonParameter.defaultValue,
                    pythonParameter.assignedBy,
                    pythonParameter.isPublic,
                    pythonParameter.typeInDocs,
                    pythonParameter.description,
                    getExistingAnnotations(pythonParameter.pathAsString()),
                ),
            );
        });
        return inferablePythonParameters;
    };

    const buildInferableModules = (pythonModules: PythonModule[]) => {
        let inferablePythonModules: InferablePythonModule[] = [];
        pythonModules.forEach((pythonModule: PythonModule) => {
            inferablePythonModules.push(
                new InferablePythonModule(
                    pythonModule.name,
                    pythonModule.imports,
                    pythonModule.fromImports,
                    buildInferableClasses(pythonModule),
                    buildInferableFunctions(pythonModule),
                    getExistingAnnotations(pythonModule.pathAsString()),
                ),
            );
        });
        return inferablePythonModules;
    };

    const infer = () => {
        const annotatedPythonPackage = buildInferablePackage(pythonPackage);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annotatedPythonPackage),
        };
        fetch('https://localhost:4280/api-editor/infer', requestOptions)
            .then((response) => response.json())
            .then((data) => console.log(data));
    };

    return (
        <Flex
            as="nav"
            borderBottom={1}
            layerStyle="subtleBorder"
            padding="0.5em 1em"
        >
            <Center>
                <Breadcrumb>
                    {pathname.map((part, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <BreadcrumbItem key={index}>
                            {enableNavigation && (
                                <BreadcrumbLink
                                    as={NavLink}
                                    to={`/${pathname
                                        .slice(0, index + 1)
                                        .join('/')}`}
                                >
                                    {part}
                                </BreadcrumbLink>
                            )}
                            {!enableNavigation && (
                                <ChakraText>{part}</ChakraText>
                            )}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumb>
            </Center>

            <Spacer />

            <HStack>
                <Button onClick={infer}>Infer</Button>
                {/* Box gets rid of popper.js warning "CSS margin styles cannot be used" */}
                <Box>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rightIcon={<Icon as={FaChevronDown} />}
                        >
                            Import
                        </MenuButton>
                        <MenuList>
                            <MenuItem
                                onClick={() =>
                                    dispatch(togglePackageDataImportDialog())
                                }
                            >
                                API Data
                            </MenuItem>
                            <MenuItem
                                onClick={() =>
                                    dispatch(toggleAnnotationImportDialog())
                                }
                            >
                                Annotations
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
                <Button onClick={exportAnnotations}>Export</Button>
                <DeleteAllAnnotations />
                <Button onClick={toggleColorMode}>
                    Toggle {colorMode === 'light' ? 'dark' : 'light'}
                </Button>
                <Box>
                    <Popover
                        isOpen={!PythonFilter.fromFilterBoxInput(filter)}
                        initialFocusRef={initialFocusRef}
                    >
                        <PopoverTrigger>
                            <InputGroup ref={initialFocusRef}>
                                <Input
                                    type="text"
                                    placeholder="Filter..."
                                    value={filter}
                                    onChange={(event) =>
                                        setFilter(event.target.value)
                                    }
                                    isInvalid={
                                        !PythonFilter.fromFilterBoxInput(filter)
                                    }
                                    borderColor={
                                        PythonFilter.fromFilterBoxInput(
                                            filter,
                                        )?.isFilteringModules()
                                            ? 'green'
                                            : 'inherit'
                                    }
                                    spellCheck={false}
                                />
                                {PythonFilter.fromFilterBoxInput(
                                    filter,
                                )?.isFilteringModules() && (
                                    <InputRightElement>
                                        <Icon as={FaCheck} color="green.500" />
                                    </InputRightElement>
                                )}
                            </InputGroup>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverBody>
                                Each scope must only be used once.
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Box>
            </HStack>
        </Flex>
    );
};

export default MenuBar;
