import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Input,
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
import { selectAnnotations } from '../features/annotations/annotationSlice';
import { FilterHelpButton } from './FilterHelpButton';
import {
    HeatMapMode,
    selectFilterString,
    selectHeatMapMode,
    setFilterString,
    setHeatMapMode,
    toggleAnnotationImportDialog,
    toggleAPIImportDialog,
    toggleUsageImportDialog,
} from '../features/ui/uiSlice';
import { DeleteAllAnnotations } from './DeleteAllAnnotations';
import { GenerateAdapters } from './GenerateAdapters';

interface MenuBarProps {
    displayInferErrors: (errors: string[]) => void;
}

export const MenuBar: React.FC<MenuBarProps> = function ({ displayInferErrors }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const dispatch = useAppDispatch();

    const annotationStore = useAppSelector(selectAnnotations);
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

    let heatMapModeString: string = '';
    if (heatMapMode === HeatMapMode.None) {
        heatMapModeString = 'none';
    } else if (heatMapMode === HeatMapMode.Usages) {
        heatMapModeString = 'usages';
    } else if (heatMapMode === HeatMapMode.Usefulness) {
        heatMapModeString = 'usefulness';
    } else if (heatMapMode === HeatMapMode.Annotations) {
        heatMapModeString = 'annotations';
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
                            Settings
                        </MenuButton>
                        <MenuList>
                            <MenuOptionGroup type="checkbox" value={colorModeArray}>
                                <MenuItemOption value={'darkMode'} onClick={toggleColorMode}>
                                    Dark mode
                                </MenuItemOption>
                            </MenuOptionGroup>
                            <MenuDivider />
                            <MenuGroup title="Heat Map Mode">
                                <MenuOptionGroup type="radio" defaultValue="none" value={heatMapModeString}>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={'none'}
                                        onClick={() => dispatch(setHeatMapMode(HeatMapMode.None))}
                                    >
                                        None
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={'usages'}
                                        onClick={() => dispatch(setHeatMapMode(HeatMapMode.Usages))}
                                    >
                                        Usages
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={'usefulness'}
                                        onClick={() => dispatch(setHeatMapMode(HeatMapMode.Usefulness))}
                                    >
                                        Usefulness
                                    </MenuItemOption>
                                    <MenuItemOption
                                        paddingLeft={8}
                                        value={'annotations'}
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
                <Input
                    type="text"
                    placeholder="Filter..."
                    value={useAppSelector(selectFilterString)}
                    onChange={(event) => dispatch(setFilterString(event.target.value))}
                    spellCheck={false}
                    minWidth="400px"
                />
                <FilterHelpButton />
            </HStack>
        </Flex>
    );
};
