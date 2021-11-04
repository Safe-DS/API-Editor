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
import React, { useRef, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
    resetAnnotations,
    toggleAnnotationImportDialog,
} from '../features/annotations/annotationSlice';
import { PythonFilter } from '../features/packageData/model/PythonFilter';
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

    const exportAnnotations = () => {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(annotationStore)], {
            type: 'application/json',
        });
        a.href = URL.createObjectURL(file);
        a.download = 'annotations.json';
        a.click();
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
                                        )?.isFiltering()
                                            ? 'green'
                                            : 'inherit'
                                    }
                                    spellCheck={false}
                                />
                                {PythonFilter.fromFilterBoxInput(
                                    filter,
                                )?.isFiltering() && (
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
