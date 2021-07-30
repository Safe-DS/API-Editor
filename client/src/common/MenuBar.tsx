import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Center,
    Flex,
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
    Text,
    useColorMode,
} from '@chakra-ui/react'
import React, { useRef } from 'react'
import { FaCheck, FaChevronDown } from 'react-icons/fa'
import { useLocation } from 'react-router'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { toggleAnnotationImportDialog } from '../features/annotations/annotationSlice'
import { PythonFilter } from '../features/packageData/model/PythonFilter'
import PythonPackage from '../features/packageData/model/PythonPackage'
import { togglePackageDataImportDialog } from '../features/packageData/packageDataSlice'
import { Setter } from './util/types'

interface MenuBarProps {
    setPythonPackage: Setter<PythonPackage>
    filter: string
    setFilter: Setter<string>
}

export default function MenuBar(props: MenuBarProps): JSX.Element {
    const { colorMode, toggleColorMode } = useColorMode()
    const initialFocusRef = useRef(null)
    const dispatch = useAppDispatch()

    const pathname = useLocation().pathname.split('/').slice(1)

    const annotationStore = useAppSelector((state) => state.annotations)
    const enableNavigation = useAppSelector((state) => state.annotations.currentUserAction.type === 'none')

    const exportAnnotations = () => {
        const a = document.createElement('a')
        const file = new Blob([JSON.stringify(annotationStore)], { type: 'application/json' })
        a.href = URL.createObjectURL(file)
        a.download = 'annotations.json'
        a.click()
    }

    return (
        <Flex as="nav" borderBottom={1} layerStyle="subtleBorder" padding="0.5em 1em">
            <Center>
                <Breadcrumb>
                    {pathname.map((part, index) => (
                        <BreadcrumbItem key={index}>
                            {enableNavigation && (
                                <BreadcrumbLink as={NavLink} to={`/${pathname.slice(0, index + 1).join('/')}`}>
                                    {part}
                                </BreadcrumbLink>
                            )}
                            {!enableNavigation && <Text>{part}</Text>}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumb>
            </Center>

            <Spacer />

            <HStack>
                {/* Box gets rid of popper.js warning "CSS margin styles cannot be used"*/}
                <Box>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                            Import
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={() => dispatch(togglePackageDataImportDialog())}>API Data</MenuItem>
                            <MenuItem onClick={() => dispatch(toggleAnnotationImportDialog())}>Annotations</MenuItem>
                        </MenuList>
                    </Menu>
                </Box>
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
                                        <Icon as={FaCheck} color="green.500" />
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
