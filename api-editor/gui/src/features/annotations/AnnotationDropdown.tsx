import { Box, Button, Icon, Menu, MenuButton, MenuGroup, MenuItem, MenuList } from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addPure, addRemove, addRequired, selectComplete, selectUsernameIsValid } from './annotationSlice';
import {
    hideAnnotationForm,
    selectCurrentUserAction,
    showAttributeAnnotationForm,
    showBoundaryAnnotationForm,
    showCalledAfterAnnotationForm,
    showConstantAnnotationForm,
    showDescriptionAnnotationForm,
    showEnumAnnotationForm,
    showGroupAnnotationForm,
    showMoveAnnotationForm,
    showOptionalAnnotationForm,
    showRenameAnnotationForm,
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
    const isComplete = Boolean(useAppSelector(selectComplete(target)));
    const isValidUsername = Boolean(useAppSelector(selectUsernameIsValid));
    const isDisabled = isComplete || !isValidUsername;
    const currentUserAction = useAppSelector(selectCurrentUserAction);

    // Event Handlers --------------------------------------------------------------------------------------------------
    const onSelectRequired = () => {
        if (
            currentUserAction.target === target &&
            (currentUserAction.type === 'attribute' ||
                currentUserAction.type === 'constant' ||
                currentUserAction.type === 'optional')
        ) {
            dispatch(hideAnnotationForm());
        }
        dispatch(addRequired({ target }));
    };

    // Render ----------------------------------------------------------------------------------------------------------
    return (
        // Box gets rid of popper.js warning "CSS margin styles cannot be used"
        <Box>
            <Menu>
                <MenuButton
                    as={Button}
                    size="sm"
                    variant="outline"
                    rightIcon={<Icon as={FaChevronDown} />}
                    disabled={isDisabled}
                >
                    Annotations
                </MenuButton>
                <MenuList>
                    {(showEnum || showBoundary) && (
                        <MenuGroup title="Type">
                            {showBoundary && (
                                <MenuItem onClick={() => dispatch(showBoundaryAnnotationForm(target))} paddingLeft={8}>
                                    @boundary
                                </MenuItem>
                            )}
                            {showEnum && (
                                <MenuItem onClick={() => dispatch(showEnumAnnotationForm(target))} paddingLeft={8}>
                                    @enum
                                </MenuItem>
                            )}
                        </MenuGroup>
                    )}

                    {(showAttribute || showConstant || showOptional || showRequired) && (
                        <MenuGroup title="Value">
                            {showAttribute && (
                                <MenuItem onClick={() => dispatch(showAttributeAnnotationForm(target))} paddingLeft={8}>
                                    @attribute
                                </MenuItem>
                            )}
                            {showConstant && (
                                <MenuItem onClick={() => dispatch(showConstantAnnotationForm(target))} paddingLeft={8}>
                                    @constant
                                </MenuItem>
                            )}
                            {showOptional && (
                                <MenuItem onClick={() => dispatch(showOptionalAnnotationForm(target))} paddingLeft={8}>
                                    @optional
                                </MenuItem>
                            )}
                            {showRequired && (
                                <MenuItem onClick={onSelectRequired} paddingLeft={8}>
                                    @required
                                </MenuItem>
                            )}
                        </MenuGroup>
                    )}

                    {(showCalledAfter ||
                        showDescription ||
                        showGroup ||
                        showMove ||
                        showPure ||
                        showRemove ||
                        showRename ||
                        showTodo) && (
                        <MenuGroup title="Uncategorized">
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
                                    paddingLeft={8}
                                >
                                    @calledAfter
                                </MenuItem>
                            )}
                            {showDescription && (
                                <MenuItem
                                    onClick={() => dispatch(showDescriptionAnnotationForm(target))}
                                    paddingLeft={8}
                                >
                                    @description
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
                                    paddingLeft={8}
                                >
                                    @group
                                </MenuItem>
                            )}
                            {showMove && (
                                <MenuItem onClick={() => dispatch(showMoveAnnotationForm(target))} paddingLeft={8}>
                                    @move
                                </MenuItem>
                            )}
                            {showPure && (
                                <MenuItem onClick={() => dispatch(addPure({ target }))} paddingLeft={8}>
                                    @pure
                                </MenuItem>
                            )}
                            {showRemove && (
                                <MenuItem onClick={() => dispatch(addRemove({ target }))} paddingLeft={8}>
                                    @remove
                                </MenuItem>
                            )}
                            {showRename && (
                                <MenuItem onClick={() => dispatch(showRenameAnnotationForm(target))} paddingLeft={8}>
                                    @rename
                                </MenuItem>
                            )}
                            {showTodo && (
                                <MenuItem onClick={() => dispatch(showTodoAnnotationForm(target))} paddingLeft={8}>
                                    @todo
                                </MenuItem>
                            )}
                        </MenuGroup>
                    )}
                </MenuList>
            </Menu>
        </Box>
    );
};
