import {
    Filter,
    selectFilterList,
    selectFilterString,
    setFilterString,
    toggleAddFilterDialog,
} from '../features/ui/uiSlice';
import { FilterInput } from './FilterInput';
import { FilterHelpButton } from './FilterHelpButton';
import React from 'react';
import {
    Button,
    HStack,
    Icon,
    Menu,
    MenuButton,
    MenuGroup,
    MenuItemOption,
    MenuList,
    MenuOptionGroup,
    Text as ChakraText,
} from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { isValidFilterToken } from '../features/packageData/model/filters/filterFactory';
import { selectNumberOfMatchedNodes } from '../features/packageData/apiSlice';
import { FaChevronDown } from 'react-icons/fa';

export const FilterControls = function () {
    const dispatch = useAppDispatch();

    const filters = useAppSelector(selectFilterList);
    const filterString = useAppSelector(selectFilterString);
    const filterList = useAppSelector(selectFilterList);
    const loadFilterOptions = filters.map((it) => {
        return <FilterOption filter={it.filter} name={it.name} key={it.filter + it.name} />;
    });
    const invalidTokens = filterString.split(' ').filter((token) => token !== '' && !isValidFilterToken(token));
    const filterIsValid = invalidTokens.length === 0;
    const alreadyIncluded = filterList.some((it) => {
        return it.filter === filterString;
    });

    return (
        <HStack>
            <Button onClick={() => dispatch(toggleAddFilterDialog())} isDisabled={!filterIsValid || alreadyIncluded}>
                Save Filter
            </Button>
            <Menu>
                <MenuButton as={Button} rightIcon={<Icon as={FaChevronDown} />}>
                    Load Filter
                </MenuButton>
                <MenuList>
                    <MenuGroup>
                        <MenuOptionGroup>{loadFilterOptions}</MenuOptionGroup>
                    </MenuGroup>
                </MenuList>
            </Menu>
            <MatchCount />
            <FilterInput />
            <FilterHelpButton />
        </HStack>
    );
};

const MatchCount = function () {
    const count = useAppSelector(selectNumberOfMatchedNodes);
    let text;
    if (count === 0) {
        text = 'No matches';
    } else if (count === 1) {
        text = '1 match';
    } else {
        text = `${count} matches`;
    }

    return <ChakraText fontWeight="bold">{text}</ChakraText>;
};

const FilterOption: React.FC<Filter> = function ({ filter, name }) {
    const dispatch = useAppDispatch();
    return <MenuItemOption onClick={() => dispatch(setFilterString(filter))}>{name}</MenuItemOption>;
};
