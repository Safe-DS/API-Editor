import { Button, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import React from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { useAppDispatch } from '../../../app/hooks'
import { showEnumAnnotationForm, showRenameAnnotationForm } from '../annotationSlice'

interface AnnotationDropdownProps {
    target: string
    showRename?: boolean
    showEnum?: boolean
}

const AnnotationDropdown: React.FC<AnnotationDropdownProps> = ({ showEnum = false, showRename = false, target }) => {
    const dispatch = useAppDispatch()

    return (
        <Menu>
            <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                Annotations
            </MenuButton>
            <MenuList>
                {showRename && <MenuItem onClick={() => dispatch(showRenameAnnotationForm(target))}>@rename</MenuItem>}
                {showEnum && <MenuItem onClick={() => dispatch(showEnumAnnotationForm(target))}>@enum</MenuItem>}
            </MenuList>
        </Menu>
    )
}

export default AnnotationDropdown
