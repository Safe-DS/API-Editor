import {
    Code,
    Box,
    Button,
    Flex, FormControl, FormLabel, Heading,
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
    MenuOptionGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Spacer,
    VStack,
    Text as ChakraText,
    useColorMode,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAnnotationStore } from '../features/annotations/annotationSlice';
import { FilterHelpButton } from './FilterHelpButton';
import {
    addFilter,
    BatchMode,
    HeatMapMode,
    selectHeatMapMode,
    selectFilterList,
    selectFilterString,
    setBatchMode,
    selectSortingMode,
    setHeatMapMode,
    setSortingMode,
    SortingMode,
    toggleAnnotationImportDialog,
    toggleAPIImportDialog,
    toggleUsageImportDialog,
    Filter, setFilterString, toggleAddFilterDialog, selectFilterName, setFilterName
} from '../features/ui/uiSlice';
import { DeleteAllAnnotations } from './DeleteAllAnnotations';
import { GenerateAdapters } from './GenerateAdapters';
import { FilterInput } from './FilterInput';
import { selectNumberOfMatchedNodes } from '../features/packageData/apiSlice';
import { FilterOptions } from 'react-markdown/lib/react-markdown';
import { useNavigate } from 'react-router-dom';

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
    const filterList = useAppSelector(selectFilterList);
    const targetString = useAppSelector(selectFilterString);

    const exportAnnotations = () => {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(annotationStore, null, 4)], {
            type: 'application/json',
        });
        a.href = URL.createObjectURL(file);
        a.download = 'annotations.json';
        a.click();
    };

    const setStatisticsViewPath = () => {
        navigate(`/statistics-view`);
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
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown}/>}>
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
                            <MenuDivider/>
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

                <Button onClick={setStatisticsViewPath}>Statistics View</Button>

                <Box>
                    <Menu closeOnSelect={false}>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                            Settings
                        </MenuButton>
                        <MenuList>
                            <MenuOptionGroup type="checkbox" value={colorModeArray}>
                                <MenuItemOption value={'darkMode'} onClick={toggleColorMode}>
                                    Dark Mode
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
                <Button onClick={() => dispatch(toggleAddFilterDialog())}>Save Filter</Button>
                <Box>
                    <Menu //closeOnSelect={true}
                    >
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown}/>}>
                            Load Filter
                        </MenuButton>
                        <MenuList>
                            <MenuGroup>
                                <FilterMenuOptions/>
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

const FilterMenuOptions: React.FC = function (){
    const filters = useAppSelector(selectFilterList);
    let options = filters.map((it)=>{return <FilterOption filter={it.filter} name={it.name} key={it.filter+it.name}/>});
    return <MenuOptionGroup>{options}</MenuOptionGroup>;
};

const FilterOption: React.FC<Filter> = function ({filter, name}){
    const dispatch = useAppDispatch();
    return <MenuItemOption onClick={()=>{dispatch(setFilterString(filter))}} >{name}</MenuItemOption>;
};

export const AddFilterDialog: React.FC = function () {
    const dispatch = useAppDispatch();
    const filter = useAppSelector(selectFilterString);
    const name = useAppSelector(selectFilterName);
    const submit = () => {
        let exists: boolean = false;
        if (!exists) {
            dispatch(addFilter({filter: filter, name: name}));
            dispatch(setFilterName(""));
            dispatch(toggleAddFilterDialog());
        }
    };
    const close = () => dispatch(toggleAddFilterDialog());

    return (
        <Modal onClose={close} isOpen size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading>Save Filter</Heading>
                </ModalHeader>
                <ModalBody>
                    <HStack marginBottom={5}><ChakraText>Name the filter </ChakraText><Code>{filter}</Code><ChakraText> to store it:</ChakraText></HStack>
                    <FormControl>
                        <Input id='nameinput' type='text' value={name}
                               onChange={(event) => dispatch(setFilterName(event.target.value))}
                               placeholder='name'/>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={submit}>
                            Submit
                        </Button>
                        <Button colorScheme="red" onClick={close}>
                            Cancel
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
