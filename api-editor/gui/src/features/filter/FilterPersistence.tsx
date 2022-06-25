import React from 'react';
import { Box, Button, Icon, Menu, MenuButton, MenuGroup, MenuItem, MenuList } from '@chakra-ui/react';
import { FaChevronUp } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
    removeFilter,
    selectFilterList,
    selectFilterString,
    setFilterString,
    toggleAddFilterDialog,
} from '../ui/uiSlice';
import { isValidFilterToken } from './model/filterFactory';
import { isEmptyList } from '../../common/util/listOperations';

export const FilterPersistence = function () {
    const dispatch = useAppDispatch();

    const currentFilterString = useAppSelector(selectFilterString);
    const savedFilters = useAppSelector(selectFilterList);

    const filterIsValid = currentFilterString.split(' ').every((token) => token === '' || isValidFilterToken(token));
    const alreadyIncluded = savedFilters.some((it) => {
        return it.filter === currentFilterString;
    });

    return (
        <>
            {alreadyIncluded ? (
                <Button
                    onClick={() => dispatch(removeFilter(currentFilterString))}
                    isDisabled={!filterIsValid || !alreadyIncluded}
                >
                    Remove Filter
                </Button>
            ) : (
                <Button
                    onClick={() => dispatch(toggleAddFilterDialog())}
                    isDisabled={!filterIsValid || alreadyIncluded}
                >
                    Save Filter
                </Button>
            )}

            <Box>
                <Menu>
                    <MenuButton as={Button} rightIcon={<Icon as={FaChevronUp} />} disabled={isEmptyList(savedFilters)}>
                        Load Filter
                    </MenuButton>
                    <MenuList>
                        <MenuGroup>
                            {savedFilters.map(({ name, filter }) => (
                                <MenuItem key={name + filter} onClick={() => dispatch(setFilterString(filter))}>
                                    {name}
                                </MenuItem>
                            ))}
                        </MenuGroup>
                    </MenuList>
                </Menu>
            </Box>
        </>
    );
};
