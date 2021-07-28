import { Box, Button, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import React from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { useAppDispatch } from '../../app/hooks'
import { addUnused, showEnumAnnotationForm, showRenameAnnotationForm } from './annotationSlice'

interface AnnotationDropdownProps {
    target: string
    showRename?: boolean
    showEnum?: boolean
    showUnused?: boolean
}

const AnnotationDropdown: React.FC<AnnotationDropdownProps> = ({
    showEnum = false,
    showRename = false,
    showUnused = false,
    target,
}) => {
    const dispatch = useAppDispatch()

    return (
        // Box gets rid of popper.js warning "CSS margin styles cannot be used"
        <Box>
            <Menu>
                <MenuButton as={Button} size="sm" variant="outline" rightIcon={<Icon as={FaChevronDown} />}>
                    Annotations
                </MenuButton>
                <MenuList>
                    {showRename && (
                        <MenuItem onClick={() => dispatch(showRenameAnnotationForm(target))}>@rename</MenuItem>
                    )}
                    {showUnused && <MenuItem onClick={() => dispatch(addUnused({ target }))}>@unused</MenuItem>}
                    {showEnum && <MenuItem onClick={() => dispatch(showEnumAnnotationForm(target))}>@enum</MenuItem>}
                </MenuList>
            </Menu>
        </Box>
    )
}

export default AnnotationDropdown
