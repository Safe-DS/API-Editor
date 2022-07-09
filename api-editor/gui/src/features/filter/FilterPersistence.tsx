import React from 'react';
import { Box, Button, Icon, Menu, MenuButton, MenuGroup, MenuItem, MenuList } from '@chakra-ui/react';
import { FaChevronUp } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { removeFilter, selectFilterList, setFilterString, toggleAddFilterDialog } from '../ui/uiSlice';
import { isEmptyList } from '../../common/util/listOperations';

interface FilterPersistenceProps {
    localFilterString: string;
    invalidTokens: string[];
}

export const FilterPersistence: React.FC<FilterPersistenceProps> = function ({ localFilterString, invalidTokens }) {
    const dispatch = useAppDispatch();

    const filterIsValid = invalidTokens.length === 0;

    const savedFilters = useAppSelector(selectFilterList);
    const alreadyIncluded = savedFilters.some((it) => {
        return it.filter === localFilterString;
    });

    return (
        <>
            {alreadyIncluded ? (
                <Button
                    onClick={() => dispatch(removeFilter(localFilterString))}
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
