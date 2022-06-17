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
    Text as ChakraText,
    useColorMode,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAnnotations } from '../features/annotations/annotationSlice';
import { FilterHelpButton } from './FilterHelpButton';
import {
    BatchMode,
    HeatMapMode,
    selectHeatMapMode,
    selectSortingMode,
    setBatchMode,
    setHeatMapMode,
    setSortingMode,
    SortingMode,
    toggleAnnotationImportDialog,
    toggleAPIImportDialog,
    toggleUsageImportDialog,
} from '../features/ui/uiSlice';
import { DeleteAllAnnotations } from './DeleteAllAnnotations';
import { GenerateAdapters } from './GenerateAdapters';
import { FilterInput } from './FilterInput';
import { selectNumberOfMatchedNodes } from '../features/packageData/apiSlice';

interface MenuBarProps {
    displayInferErrors: (errors: string[]) => void;
}

export const MenuBar: React.FC<MenuBarProps> = function ({ displayInferErrors }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const dispatch = useAppDispatch();

    const annotationStore = useAppSelector(selectAnnotations);
    const sortingMode = useAppSelector(selectSortingMode);
    const heatMapMode = useAppSelector(selectHeatMapMode);

    const exportAnnotations = () => {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(annotationStore, null, 4)], {
            type: 'application/json',
        });
        a.href = URL.createObjectURL(file);
        a.download = 'annotations.json';
        a.click();
    };

    const colorModeArray: string[] = [];
    if (colorMode === 'dark') {
        colorModeArray.push('darkMode');
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
                    <Menu closeOnSelect={false}>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
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
                            <MenuOptionGroup type="checkbox" value={colorModeArray}>
                                <MenuItemOption value={'darkMode'} onClick={toggleColorMode}>
                                    Dark mode
                                </MenuItemOption>
                            </MenuOptionGroup>
                            <MenuDivider />
                            <MenuGroup title="Module/Class/Function Sorting">
                                <MenuOptionGroup
                                    type="radio"
                                    defaultValue={SortingMode.Alphabetical}
                                    value={sortingMode}
                                >
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
                            <MenuGroup title="Heat Map Mode">
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

            <HStack>
                <MatchCount />
                <FilterInput />
                <FilterHelpButton />
            </HStack>
        </Flex>
    );
};

const MatchCount = function () {
    const count = useAppSelector(selectNumberOfMatchedNodes);
    let text;
    if (count === 0) {
        text = 'No matches';
    } else if (count === 1) {
        text = '1 match';
    } else {
        text = `${count} matches`;
    }

    return <ChakraText fontWeight="bold">{text}</ChakraText>;
};
