import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Center,
    Flex,
    HStack,
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
    useColorMode,
} from '@chakra-ui/react'
import React, { useRef } from 'react'
import { FaCheck, FaChevronDown } from 'react-icons/fa'
import { useLocation } from 'react-router'
import { NavLink } from 'react-router-dom'
import AnnotationStore from '../../model/annotation/AnnotationStore'
import { PythonFilter } from '../../model/python/PythonFilter'
import PythonPackage from '../../model/python/PythonPackage'
import { Setter } from '../../util/types'

interface MenuBarProps {
    setPythonPackage: Setter<PythonPackage>
    annotationStore: AnnotationStore
    setAnnotationStore: Setter<AnnotationStore>
    filter: string
    setFilter: Setter<string>
    openImportAnnotationFileDialog: () => void
    openImportPythonPackageDialog: () => void
}

export default function MenuBar(props: MenuBarProps): JSX.Element {
    const { colorMode, toggleColorMode } = useColorMode()
    const initialFocusRef = useRef(null)

    const pathname = useLocation().pathname.split('/').slice(1)

    const exportAnnotations = () => {
        props.annotationStore.downloadAnnotations(props.annotationStore.toJsonString())
    }

    return (
        <Flex as="nav" borderBottom={1} layerStyle="subtleBorder" padding="0.5em 1em">
            <Center>
                <Breadcrumb>
                    {pathname.map((part, index) => (
                        <BreadcrumbItem key={index}>
                            <BreadcrumbLink as={NavLink} to={`/${pathname.slice(0, index + 1).join('/')}`}>
                                {part}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    ))}
                </Breadcrumb>
            </Center>

            <Spacer />

            <HStack>
                <Menu>
                    <MenuButton as={Button} rightIcon={<FaChevronDown />}>
                        Import
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={props.openImportPythonPackageDialog}>Python Package</MenuItem>
                        <MenuItem onClick={props.openImportAnnotationFileDialog}>Annotations</MenuItem>
                    </MenuList>
                </Menu>

                <Button onClick={exportAnnotations}>Export</Button>
                <Button onClick={toggleColorMode}>Toggle {colorMode === 'light' ? 'Dark' : 'Light'}</Button>

                <Box>
                    <Popover isOpen={!PythonFilter.fromFilterBoxInput(props.filter)} initialFocusRef={initialFocusRef}>
                        <PopoverTrigger>
                            <InputGroup ref={initialFocusRef}>
                                <Input
                                    type="text"
                                    placeholder="Filter..."
                                    value={props.filter}
                                    onChange={(event) => props.setFilter(event.target.value)}
                                    isInvalid={!PythonFilter.fromFilterBoxInput(props.filter)}
                                    borderColor={
                                        PythonFilter.fromFilterBoxInput(props.filter)?.isFiltering()
                                            ? 'green'
                                            : 'inherit'
                                    }
                                    spellCheck={false}
                                />
                                {PythonFilter.fromFilterBoxInput(props.filter)?.isFiltering() && (
                                    <InputRightElement>
                                        <FaCheck color="green" />
                                    </InputRightElement>
                                )}
                            </InputGroup>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverBody>Each scope must only be used once.</PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Box>
            </HStack>
        </Flex>
    )
}
