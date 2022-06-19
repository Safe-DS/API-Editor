import React from 'react';
import { Button, Icon, Menu, MenuButton, MenuGroup, MenuItem, MenuList } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectFilterList, selectFilterString, setFilterString, toggleAddFilterDialog } from '../ui/uiSlice';
import { isValidFilterToken } from './model/filterFactory';

export const FilterPersistence = function () {
    const dispatch = useAppDispatch();

    const currentFilterString = useAppSelector(selectFilterString);
    const savedFilters = useAppSelector(selectFilterList);

    const filterIsValid = currentFilterString.split(' ').every((token) => isValidFilterToken(token));
    const alreadyIncluded = savedFilters.some((it) => {
        return it.filter === currentFilterString;
    });

    return (
        <>
            <Button onClick={() => dispatch(toggleAddFilterDialog())} isDisabled={!filterIsValid || alreadyIncluded}>
                Save Filter
            </Button>
            <Menu>
                <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
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
        </>
    );
};
