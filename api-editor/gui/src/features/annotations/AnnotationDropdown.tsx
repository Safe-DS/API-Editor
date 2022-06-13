import { Box, Button, Icon, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch } from '../../app/hooks';
import { addPure, addRemove, addRequired } from './annotationSlice';
import {
    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showConstantAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
    showDescriptionAnnotationForm,
    showTodoAnnotationForm,
} from '../ui/uiSlice';

interface AnnotationDropdownProps {
    showAttribute?: boolean;
    showBoundary?: boolean;
    showCalledAfter?: boolean;
    showConstant?: boolean;
    showDescription?: boolean;
    showEnum?: boolean;
    showGroup?: boolean;
    showMove?: boolean;
    showOptional?: boolean;
    showPure?: boolean;
    showRename?: boolean;
    showRequired?: boolean;
    showRemove?: boolean;
    showTodo?: boolean;
    target: string;
}

export const AnnotationDropdown: React.FC<AnnotationDropdownProps> = function ({
    showAttribute = false,
    showBoundary = false,
    showCalledAfter = false,
    showConstant = false,
    showDescription = false,
    showGroup = false,
    showEnum = false,
    showMove = false,
    showPure = false,
    showOptional = false,
    showRename = false,
    showRequired = false,
    showRemove = false,
    showTodo = false,
    target,
}) {
    const dispatch = useAppDispatch();

    return (
        // Box gets rid of popper.js warning "CSS margin styles cannot be used"
        <Box>
            <Menu>
                <MenuButton as={Button} size="sm" variant="outline" rightIcon={<Icon as={FaChevronDown} />}>
                    Annotations
                </MenuButton>
                <MenuList>
                    {showAttribute && (
                        <MenuItem onClick={() => dispatch(showAttributeAnnotationForm(target))}>@attribute</MenuItem>
                    )}
                    {showBoundary && (
                        <MenuItem onClick={() => dispatch(showBoundaryAnnotationForm(target))}>@boundary</MenuItem>
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
                        <MenuItem onClick={() => dispatch(showConstantAnnotationForm(target))}>@constant</MenuItem>
                    )}
                    {showDescription && (
                        <MenuItem onClick={() => dispatch(showDescriptionAnnotationForm(target))}>@description</MenuItem>
                    )}
                    {showEnum && <MenuItem onClick={() => dispatch(showEnumAnnotationForm(target))}>@enum</MenuItem>}
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
                    {showMove && <MenuItem onClick={() => dispatch(showMoveAnnotationForm(target))}>@move</MenuItem>}
                    {showOptional && (
                        <MenuItem onClick={() => dispatch(showOptionalAnnotationForm(target))}>@optional</MenuItem>
                    )}
                    {showPure && <MenuItem onClick={() => dispatch(addPure({ target }))}>@pure</MenuItem>}
                    {showRemove && <MenuItem onClick={() => dispatch(addRemove({ target }))}>@remove</MenuItem>}
                    {showRename && (
                        <MenuItem onClick={() => dispatch(showRenameAnnotationForm(target))}>@rename</MenuItem>
                    )}
                    {showRequired && <MenuItem onClick={() => dispatch(addRequired({ target }))}>@required</MenuItem>}
                    {showTodo && (
                        <MenuItem onClick={() => dispatch(showTodoAnnotationForm(target))}>@todo</MenuItem>
                    )}
                </MenuList>
            </Menu>
        </Box>
    );
};
