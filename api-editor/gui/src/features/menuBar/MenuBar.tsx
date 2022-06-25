import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    useColorMode,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    AnnotationStore,
    redo,
    selectAnnotationStore,
    selectUsernameIsValid,
    undo,
} from '../annotations/annotationSlice';
import {
    BatchMode,
    HeatMapMode,
    selectExpandDocumentationByDefault,
    selectFilter,
    selectHeatMapMode,
    selectShowStatistics,
    selectSortingMode,
    setAllCollapsedInTreeView,
    setAllExpandedInTreeView,
    setBatchMode,
    setHeatMapMode,
    setSortingMode,
    SortingMode,
    toggleAnnotationImportDialog,
    toggleAPIImportDialog,
    toggleExpandDocumentationByDefault,
    toggleStatisticsView,
    toggleUsageImportDialog,
} from '../ui/uiSlice';
import { DeleteAllAnnotations } from './DeleteAllAnnotations';
import { GenerateAdapters } from './GenerateAdapters';
import { PythonPackage } from '../packageData/model/PythonPackage';
import { PythonDeclaration } from '../packageData/model/PythonDeclaration';
import { AbstractPythonFilter } from '../filter/model/AbstractPythonFilter';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import {
    selectFilteredPythonPackage,
    selectFlatSortedDeclarationList,
    selectRawPythonPackage,
} from '../packageData/apiSlice';
import { selectUsages } from '../usages/usageSlice';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuBarProps {
    displayInferErrors: (errors: string[]) => void;
}

export const MenuBar: React.FC<MenuBarProps> = function ({ displayInferErrors }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const annotationStore = useAppSelector(selectAnnotationStore);
    const sortingMode = useAppSelector(selectSortingMode);
    const heatMapMode = useAppSelector(selectHeatMapMode);
    const showStatistics = useAppSelector(selectShowStatistics);
    const usernameIsValid = useAppSelector(selectUsernameIsValid);
    const expandDocumentationByDefault = useAppSelector(selectExpandDocumentationByDefault);

    const allDeclarations = useAppSelector(selectFlatSortedDeclarationList);
    const pythonPackage = useAppSelector(selectFilteredPythonPackage);
    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const pythonFilter = useAppSelector(selectFilter);
    const annotations = useAppSelector(selectAnnotationStore);
    const usages = useAppSelector(selectUsages);
    const declaration = rawPythonPackage.getDeclarationById(useLocation().pathname.split('/').splice(1).join('/'));

    const exportAnnotations = () => {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(annotationStore, null, 4)], {
            type: 'application/json',
        });
        a.href = URL.createObjectURL(file);
        a.download = 'annotations.json';
        a.click();
    };

    const visualSettings: string[] = [];
    if (colorMode === 'dark') {
        visualSettings.push('darkMode');
    }
    if (showStatistics) {
        visualSettings.push('statistics');
    }
    if (expandDocumentationByDefault) {
        visualSettings.push('toggleDocumentationByDefault');
    }

    return (
        <Flex as="nav" borderBottom={1} layerStyle="subtleBorder" padding="0.5em 1em">
            <HStack>
                {/* Box gets rid of popper.js warning "CSS margin styles cannot be used" */}
                <Box>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                            File
                        </MenuButton>
                        <MenuList>
                            <MenuGroup title="Import">
                                <MenuItem paddingLeft={8} onClick={() => dispatch(toggleAPIImportDialog())}>
                                    API Data
                                </MenuItem>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(toggleUsageImportDialog())}>
                                    Usages
                                </MenuItem>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(toggleAnnotationImportDialog())}>
                                    Annotations
                                </MenuItem>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuGroup title="Export">
                                <MenuItem paddingLeft={8} onClick={exportAnnotations}>
                                    Annotations
                                </MenuItem>
                            </MenuGroup>
                        </MenuList>
                    </Menu>
                </Box>

                <GenerateAdapters displayInferErrors={displayInferErrors} />
                <DeleteAllAnnotations />

                <Box>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />} disabled={!usernameIsValid}>
                            Batch
                        </MenuButton>
                        <MenuList>
                            <MenuGroup title={'Annotate'}>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(setBatchMode(BatchMode.Rename))}>
                                    Rename
                                </MenuItem>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(setBatchMode(BatchMode.Move))}>
                                    Move
                                </MenuItem>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(setBatchMode(BatchMode.Remove))}>
                                    Remove
                                </MenuItem>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(setBatchMode(BatchMode.Required))}>
                                    Required
                                </MenuItem>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(setBatchMode(BatchMode.Constant))}>
                                    Constant
                                </MenuItem>
                                <MenuItem paddingLeft={8} onClick={() => dispatch(setBatchMode(BatchMode.Optional))}>
                                    Optional
                                </MenuItem>
                            </MenuGroup>
                        </MenuList>
                    </Menu>
                </Box>

                <Box>
                    <Menu closeOnSelect={false}>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                            Settings
                        </MenuButton>
                        <MenuList>
                            <MenuGroup title="Visual">
                                <MenuOptionGroup type="checkbox" value={visualSettings}>
                                    <MenuItemOption value={'darkMode'} onClick={toggleColorMode}>
                                        Dark Mode
                                    </MenuItemOption>
                                    <MenuItemOption
                                        value={'statistics'}
                                        onClick={() => dispatch(toggleStatisticsView())}
                                    >
                                        Show Statistics
                                    </MenuItemOption>
                                    <MenuItemOption
                                        value={'toggleDocumentationByDefault'}
                                        onClick={() => dispatch(toggleExpandDocumentationByDefault())}
                                    >
                                        Expand Documentation by Default
                                    </MenuItemOption>
                                </MenuOptionGroup>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuGroup title="API Element Sorting">
                                <MenuOptionGroup type="radio" defaultValue={SortingMode.Default} value={sortingMode}>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={SortingMode.Default}
                                        onClick={() => dispatch(setSortingMode(SortingMode.Default))}
                                    >
                                        Default
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={SortingMode.Alphabetical}
                                        onClick={() => dispatch(setSortingMode(SortingMode.Alphabetical))}
                                    >
                                        Alphabetical
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={SortingMode.Usages}
                                        onClick={() => dispatch(setSortingMode(SortingMode.Usages))}
                                    >
                                        Usages (Descending)
                                    </MenuItemOption>
                                </MenuOptionGroup>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuGroup title="Heatmap Mode">
                                <MenuOptionGroup type="radio" defaultValue={HeatMapMode.None} value={heatMapMode}>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={HeatMapMode.None}
                                        onClick={() => dispatch(setHeatMapMode(HeatMapMode.None))}
                                    >
                                        None
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={HeatMapMode.Usages}
                                        onClick={() => dispatch(setHeatMapMode(HeatMapMode.Usages))}
                                    >
                                        Usages
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={HeatMapMode.Usefulness}
                                        onClick={() => dispatch(setHeatMapMode(HeatMapMode.Usefulness))}
                                    >
                                        Usefulness
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={HeatMapMode.Annotations}
                                        onClick={() => dispatch(setHeatMapMode(HeatMapMode.Annotations))}
                                    >
                                        Annotations
                                    </MenuItemOption>
                                </MenuOptionGroup>
                            </MenuGroup>
                        </MenuList>
                    </Menu>
                </Box>
            </HStack>

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
        </Flex>
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
