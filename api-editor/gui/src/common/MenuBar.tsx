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
    Spacer,
    useColorMode,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAnnotationStore, selectUsernameIsValid } from '../features/annotations/annotationSlice';
import {
    BatchMode,
    HeatMapMode,
    selectExpandDocumentationByDefault,
    selectHeatMapMode,
    selectShowStatistics,
    selectSortingMode,
    setBatchMode,
    setHeatMapMode,
    setSortingMode,
    SortingMode,
    toggleAnnotationImportDialog,
    toggleAPIImportDialog,
    toggleExpandDocumentationByDefault,
    toggleStatisticsView,
    toggleUsageImportDialog,
} from '../features/ui/uiSlice';
import { DeleteAllAnnotations } from './DeleteAllAnnotations';
import { GenerateAdapters } from './GenerateAdapters';
import { FilterControls } from '../features/filter/FilterControls';

interface MenuBarProps {
    displayInferErrors: (errors: string[]) => void;
}

export const MenuBar: React.FC<MenuBarProps> = function ({ displayInferErrors }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const dispatch = useAppDispatch();

    const annotationStore = useAppSelector(selectAnnotationStore);
    const sortingMode = useAppSelector(selectSortingMode);
    const heatMapMode = useAppSelector(selectHeatMapMode);
    const showStatistics = useAppSelector(selectShowStatistics);
    const usernameIsValid = useAppSelector(selectUsernameIsValid);
    const expandDocumentationByDefault = useAppSelector(selectExpandDocumentationByDefault);

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

            <Spacer />

            <FilterControls />
        </Flex>
    );
};
