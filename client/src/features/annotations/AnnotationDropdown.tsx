import {
    Box,
    Button,
    Icon,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch } from '../../app/hooks';
import {
    addRequired,
    addUnused,
    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
} from './annotationSlice';

interface AnnotationDropdownProps {
    target: string;
    showAttribute?: boolean;
    showBoundary?: boolean;
    showCalledAfter?: boolean;
    showConstant?: boolean;
    showGroup?: boolean;
    showRename?: boolean;
    showEnum?: boolean;
    showUnused?: boolean;
    showRequired?: boolean;
    showOptional?: boolean;
}

const AnnotationDropdown: React.FC<AnnotationDropdownProps> = function ({
    showAttribute = false,
    showBoundary = false,
    showCalledAfter = false,
    showConstant = false,
    showGroup = false,
    showEnum = false,
    showOptional = false,
    showRename = false,
    showRequired = false,
    showUnused = false,
    target,
}) {
    const dispatch = useAppDispatch();

    return (
        // Box gets rid of popper.js warning "CSS margin styles cannot be used"
        <Box>
            <Menu>
                <MenuButton
                    as={Button}
                    size="sm"
                    variant="outline"
                    rightIcon={<Icon as={FaChevronDown} />}
                >
                    Annotations
                </MenuButton>
                <MenuList>
                    {showAttribute && (
                        <MenuItem
                            onClick={() =>
                                dispatch(showAttributeAnnotationForm(target))
                            }
                        >
                            @attribute
                        </MenuItem>
                    )}
                    {showBoundary && (
                        <MenuItem
                            onClick={() =>
                                dispatch(showBoundaryAnnotationForm(target))
                            }
                        >
                            @boundary
                        </MenuItem>
                    )}
                    {showCalledAfter && (
                        <MenuItem
                            onClick={() =>
                                dispatch(
                                    showCalledAfterAnnotationForm({
                                        target,
                                        calledAfterName: '',
                                    }),
                                )
                            }
                        >
                            @calledAfter
                        </MenuItem>
                    )}
                    {showConstant && (
                        <MenuItem
                            onClick={() =>
                                dispatch(showConstantAnnotationForm(target))
                            }
                        >
                            @constant
                        </MenuItem>
                    )}
                    {showEnum && (
                        <MenuItem
                            onClick={() =>
                                dispatch(showEnumAnnotationForm(target))
                            }
                        >
                            @enum
                        </MenuItem>
                    )}
                    {showGroup && (
                        <MenuItem
                            onClick={() =>
                                dispatch(
                                    showGroupAnnotationForm({
                                        target,
                                        groupName: '',
                                    }),
                                )
                            }
                        >
                            @group
                        </MenuItem>
                    )}
                    {showOptional && (
                        <MenuItem
                            onClick={() =>
                                dispatch(showOptionalAnnotationForm(target))
                            }
                        >
                            @optional
                        </MenuItem>
                    )}
                    {showRename && (
                        <MenuItem
                            onClick={() =>
                                dispatch(showRenameAnnotationForm(target))
                            }
                        >
                            @rename
                        </MenuItem>
                    )}
                    {showRequired && (
                        <MenuItem
                            onClick={() => dispatch(addRequired({ target }))}
                        >
                            @required
                        </MenuItem>
                    )}
                    {showUnused && (
                        <MenuItem
                            onClick={() => dispatch(addUnused({ target }))}
                        >
                            @unused
                        </MenuItem>
                    )}
                </MenuList>
            </Menu>
        </Box>
    );
};

export default AnnotationDropdown;
