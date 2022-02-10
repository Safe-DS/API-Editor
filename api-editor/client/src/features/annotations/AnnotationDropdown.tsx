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
    addPure,
    addRequired,
    addUnused,
    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
} from './annotationSlice';

interface AnnotationDropdownProps {
    showAttribute?: boolean;
    showBoundary?: boolean;
    showCalledAfter?: boolean;
    showConstant?: boolean;
    showEnum?: boolean;
    showGroup?: boolean;
    showMove?: boolean;
    showOptional?: boolean;
    showPure?: boolean;
    showRename?: boolean;
    showRequired?: boolean;
    showUnused?: boolean;
    target: string;
}

const AnnotationDropdown: React.FC<AnnotationDropdownProps> = function ({
    showAttribute = false,
    showBoundary = false,
    showCalledAfter = false,
    showConstant = false,
    showGroup = false,
    showEnum = false,
    showMove = false,
    showPure = false,
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
                    {showMove && (
                        <MenuItem
                            onClick={() =>
                                dispatch(showMoveAnnotationForm(target))
                            }
                        >
                            @move
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
                    {showPure && (
                        <MenuItem onClick={() => dispatch(addPure({ target }))}>
                            @pure
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
