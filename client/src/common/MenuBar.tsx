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
import React, { useRef, useEffect, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
    resetAnnotations,
    toggleAnnotationImportDialog,
} from '../features/annotations/annotationSlice';
import PythonClass from '../features/packageData/model/PythonClass';
import { PythonFilter } from '../features/packageData/model/PythonFilter';
import PythonFunction from '../features/packageData/model/PythonFunction';
import PythonModule from '../features/packageData/model/PythonModule';
import PythonPackage from '../features/packageData/model/PythonPackage';
import {
    selectAttribute,
    selectBoundary,
    selectCalledAfters,
    selectConstant,
    selectEnum,
    selectGroups,
    selectMove,
    selectOptional,
    selectRenaming,
    selectRequired,
    selectUnused,
} from '../features/annotations/annotationSlice';
import {
    parsePythonPackageJson,
    PythonPackageJson,
} from '../features/packageData/model/PythonPackageBuilder';
import PythonParameter from '../features/packageData/model/PythonParameter';
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

    const getExistingAnnotations = (target: string) => {
        let targetAnnotations: any[] = [];
        possibleAnnotations.forEach((annotation) => {
            const returnedAnnotations = returnFormattedAnnotation(
                target,
                annotation,
            );
            if (returnedAnnotations) {
                targetAnnotations.concat(returnedAnnotations);
                console.log(targetAnnotations);
            }
        });
        return targetAnnotations;
    };

    const returnFormattedAnnotation = (
        target: string,
        annotationName: string,
    ) => {
        switch (annotationName) {
            case 'Attribute':
                return useAppSelector(selectAttribute(target));
            case 'Boundary':
                return useAppSelector(selectBoundary(target));
            case 'CalledAfters':
                return Object.values(
                    useAppSelector(selectCalledAfters(target)),
                );
            case 'Constant':
                return useAppSelector(selectConstant(target));
            case 'Groups':
                return Object.values(useAppSelector(selectGroups(target)));
            case 'Enum':
                return useAppSelector(selectEnum(target));
            case 'Move':
                return useAppSelector(selectMove(target));
            case 'Optional':
                return useAppSelector(selectOptional(target));
            case 'Rename':
                return useAppSelector(selectRenaming(target));
            case 'Required':
                return useAppSelector(selectRequired(target));
            case 'Unused':
                return useAppSelector(selectUnused(target));
        }
        return undefined;
    };

    const buildInferablePackage = (pythonPackage: PythonPackage) => {
        return {
            name: pythonPackage.name,
            distribution: pythonPackage.distribution,
            version: pythonPackage.version,
            annotations: getExistingAnnotations(pythonPackage.pathAsString()),
            modules: buildInferableModules(pythonPackage),
        };
    };

    const buildInferableClasses = (pythonModule: PythonModule) => {
        let pythonClasses = [];
        pythonModule.classes.forEach((pythonClass: PythonClass) => {
            pythonClasses.push({
                name: pythonClass.name,
                qualifiedName: pythonClass.qualifiedName,
                decorators: pythonClass.decorators,
                superclasses: pythonClass.superclasses,
                description: pythonClass.description,
                fullDocString: pythonClass.fullDocstring,
                methods: buildInferableFunctions(pythonClass),
                annotations: getExistingAnnotations(pythonClass.pathAsString()),
            });
        });
        return pythonClasses;
    };

    const buildInferableFunctions = (
        pythonDeclaration: PythonModule | PythonClass,
    ) => {
        let pythonFunctions = [];
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
        return {
            name: pythonFunction.name,
            qualifiedName: pythonFunction.qualifiedName,
            decorators: pythonFunction.decorators,
            parameters: buildInferableParameters(pythonFunction),
            results: pythonFunction.results,
            isPublic: pythonFunction.isPublic,
            description: pythonFunction.description,
            fullDocstring: pythonFunction.fullDocstring,
            annotations: getExistingAnnotations(pythonFunction.pathAsString()),
        };
    };

    const buildInferableParameters = (pythonFunction: PythonFunction) => {
        let pythonParameters = [];
        pythonFunction.parameters.forEach(
            (pythonParameter: PythonParameter) => {
                pythonParameters.push({
                    name: pythonParameter.name,
                    defaultValue: pythonParameter.defaultValue,
                    assignedBy: pythonParameter.assignedBy,
                    isPublic: pythonParameter.isPublic,
                    typeInDocs: pythonParameter.typeInDocs,
                    description: pythonParameter.description,
                    annotations: getExistingAnnotations(
                        pythonParameter.pathAsString(),
                    ),
                });
            },
        );
        return pythonParameters;
    };

    const buildInferableModules = (pythonPackage: PythonPackage) => {
        let pythonModules = [];
        pythonPackage.modules.forEach((pythonModule: PythonModule) => {
            pythonModules.push({
                name: pythonModule.name,
                imports: pythonModule.imports,
                fromImports: pythonModule.fromImports,
                classes: buildInferableClasses(pythonModule),
                functions: buildInferableFunctions(pythonModule),
                annotations: getExistingAnnotations(
                    pythonModule.pathAsString(),
                ),
            });
        });
        return pythonModules;
    };

    const infer = () => {
        const annotatedPythonPackage = buildInferablePackage(pythonPackage);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pythonPackage),
        };
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
