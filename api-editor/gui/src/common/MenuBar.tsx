import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    InputGroup,
    ListItem,
    Menu,
    MenuButton,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    Spacer,
    Text as ChakraText,
    UnorderedList,
    useColorMode,
    VStack,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { resetAnnotations, toggleAnnotationImportDialog } from '../features/annotations/annotationSlice';
import AnnotatedPythonPackageBuilder from '../features/annotatedPackageData/model/AnnotatedPythonPackageBuilder';
import PythonPackage from '../features/packageData/model/PythonPackage';
import {
    selectShowPrivateDeclarations,
    togglePackageDataImportDialog,
    toggleShowPrivateDeclarations,
} from '../features/packageData/packageDataSlice';
import { Setter } from './util/types';
import { toggleUsageImportDialog } from '../features/usages/usageSlice';

interface MenuBarProps {
    pythonPackage: PythonPackage;
    filter: string;
    setFilter: Setter<string>;
    displayInferErrors: (errors: string[]) => void;
}

const HelpButton = function () {
    return (
        <Popover>
            <PopoverTrigger>
                <IconButton variant="ghost" icon={<Icon name="help" />} aria-label="help" />
            </PopoverTrigger>
            <PopoverContent minWidth={462} fontSize="sm" marginRight={2}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Filter Options</PopoverHeader>
                <PopoverBody>
                    <UnorderedList spacing={2}>
                        <ListItem>
                            <ChakraText>
                                <strong>is:xy</strong>
                            </ChakraText>
                            <ChakraText>
                                Displays only elements that are of the given type xy. Possible types are: module, class,
                                function, parameter.
                            </ChakraText>
                        </ListItem>
                        <ListItem>
                            <ChakraText>
                                <strong>hasName:xy</strong>
                            </ChakraText>
                            <ChakraText>Displays only elements with names that contain the given string xy.</ChakraText>
                        </ListItem>
                        <ListItem>
                            <ChakraText>
                                <strong>is:annotated</strong>
                            </ChakraText>
                            <ChakraText>Displays only elements that have been annotated.</ChakraText>
                        </ListItem>
                        <ListItem>
                            <ChakraText>
                                <strong>hasAnnotation:xy</strong>
                            </ChakraText>
                            <ChakraText>
                                Displays only elements that are annotated with the given type xy. Possible types:
                                unused, constant, required, optional, enum and boundary.
                            </ChakraText>
                        </ListItem>
                        <ListItem>
                            <ChakraText>
                                <strong>!filter</strong>
                            </ChakraText>
                            <ChakraText>
                                Displays only elements that do not match the given filter. Possible filters are any in
                                this list.
                            </ChakraText>
                        </ListItem>
                    </UnorderedList>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

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
            <Button onClick={() => setIsOpen(true)}>Delete all annotations</Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={handleCancel}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Heading>Delete all annotations</Heading>
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack alignItems="flexStart">
                                <ChakraText>Are you sure? You can't undo this action afterwards.</ChakraText>
                                <ChakraText>
                                    Hint: Consider exporting your work first by clicking on the "Export" button in the
                                    menu bar.
                                </ChakraText>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleConfirm} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

const MenuBar: React.FC<MenuBarProps> = function ({ pythonPackage, filter, setFilter, displayInferErrors }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const initialFocusRef = useRef(null);
    const dispatch = useAppDispatch();

    const annotationStore = useAppSelector((state) => state.annotations);

    const exportAnnotations = () => {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(annotationStore)], {
            type: 'application/json',
        });
        a.href = URL.createObjectURL(file);
        a.download = 'annotations.json';
        a.click();
    };

    const infer = () => {
        const annotatedPythonPackageBuilder = new AnnotatedPythonPackageBuilder(pythonPackage, annotationStore);
        const annotatedPythonPackage = annotatedPythonPackageBuilder.generateAnnotatedPythonPackage();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annotatedPythonPackage),
        };
        fetch('/api-editor/infer', requestOptions).then(async (response) => {
            if (!response.ok) {
                const jsonResponse = await response.json();
                displayInferErrors(jsonResponse);
            } else {
                const jsonBlob = await response.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(jsonBlob);
                a.download = 'simpleml.zip';
                a.click();
            }
        });
    };

    const settings: string[] = [];
    if (useAppSelector(selectShowPrivateDeclarations)) {
        settings.push('showPrivateDeclarations');
    }
    if (colorMode == 'dark') {
        settings.push('darkMode');
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
                                <MenuItem onClick={() => dispatch(togglePackageDataImportDialog())}>API Data</MenuItem>
                                <MenuItem onClick={() => dispatch(toggleUsageImportDialog())}>Usages</MenuItem>
                                <MenuItem onClick={() => dispatch(toggleAnnotationImportDialog())}>
                                    Annotations
                                </MenuItem>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuGroup title="Export">
                                <MenuItem onClick={exportAnnotations}>Annotations</MenuItem>
                            </MenuGroup>
                        </MenuList>
                    </Menu>
                </Box>

                <Button onClick={infer}>Generate adapters</Button>
                <DeleteAllAnnotations />

                <Box>
                    <Menu closeOnSelect={false}>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                            Settings
                        </MenuButton>
                        <MenuList>
                            <MenuOptionGroup type="checkbox" value={settings}>
                                <MenuItemOption
                                    value="showPrivateDeclarations"
                                    onClick={() => dispatch(toggleShowPrivateDeclarations())}
                                >
                                    Show private declarations
                                </MenuItemOption>

                                <MenuItemOption value={'darkMode'} onClick={toggleColorMode}>
                                    Dark mode
                                </MenuItemOption>
                            </MenuOptionGroup>
                        </MenuList>
                    </Menu>
                </Box>
            </HStack>

            <Spacer />

            <HStack>
                <Box>
                    <Popover
                        isOpen={
                            false
                            // !PythonFilter.fromFilterBoxInput(filter)
                        }
                        initialFocusRef={initialFocusRef}
                    >
                        <PopoverTrigger>
                            <InputGroup ref={initialFocusRef}>
                                <Input
                                    type="text"
                                    placeholder="Filter..."
                                    value={filter}
                                    onChange={(event) => setFilter(event.target.value)}
                                    // isInvalid={!PythonFilter.fromFilterBoxInput(filter)}
                                    // borderColor={
                                    //     PythonFilter.fromFilterBoxInput(filter)?.isFilteringModules()
                                    //         ? 'green'
                                    //         : 'inherit'
                                    // }
                                    spellCheck={false}
                                    minWidth="400px"
                                />
                                {/*{PythonFilter.fromFilterBoxInput(filter)?.isFilteringModules() && (*/}
                                {/*    <InputRightElement>*/}
                                {/*        <Icon as={FaCheck} color="green.500" />*/}
                                {/*    </InputRightElement>*/}
                                {/*)}*/}
                            </InputGroup>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverBody>Each scope must only be used once.</PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Box>
                <HelpButton />
            </HStack>
        </Flex>
    );
};

export default MenuBar;
