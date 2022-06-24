import {
    Button,
    Code,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text as ChakraText,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectFilterList, selectFilterString, toggleAddFilterDialog, upsertFilter } from '../ui/uiSlice';
import { isValidFilterToken } from './model/filterFactory';

export const SaveFilterDialog: React.FC = function () {
    const dispatch = useAppDispatch();
    const savedFilters = useAppSelector(selectFilterList);

    const [filterName, setFilterName] = useState('');
    const [filterString, setFilterString] = useState(useAppSelector(selectFilterString));

    const alreadyIncluded = savedFilters.some((it) => {
        return it.name === filterName;
    });
    const invalidTokens = filterString.split(' ').filter((token) => token !== '' && !isValidFilterToken(token));
    const filterStringIsValid = invalidTokens.length === 0;

    const submit = () => {
        if (filterName.trim() !== '' && filterStringIsValid) {
            dispatch(upsertFilter({ filter: filterString, name: filterName }));
            dispatch(toggleAddFilterDialog());
        }
    };
    const close = () => {
        dispatch(toggleAddFilterDialog());
    };

    return (
        <Modal onClose={close} isOpen size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading>Save Filter</Heading>
                </ModalHeader>
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isInvalid={filterName.trim() === ''}>
                            <FormLabel htmlFor="newFilterName">Filter Name:</FormLabel>
                            <Input
                                type="text"
                                id="newFilterName"
                                value={filterName}
                                onChange={(event) => setFilterName(event.target.value)}
                                spellCheck={false}
                            />
                            {filterName.trim() === '' && (
                                <FormErrorMessage>The filter name must not be blank.</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isInvalid={!filterStringIsValid}>
                            <FormLabel htmlFor="newFilterString">Filter String:</FormLabel>
                            <Textarea
                                id="newFilterString"
                                value={filterString}
                                onChange={(event) => setFilterString(event.target.value)}
                                spellCheck={false}
                            />
                            {!filterStringIsValid && (
                                <FormErrorMessage>
                                    <ChakraText>
                                        Filter has invalid tokens:{' '}
                                        {invalidTokens.map((token, index) => (
                                            <>
                                                <Code>{token}</Code>
                                                {index < invalidTokens.length - 1 && ', '}
                                            </>
                                        ))}
                                    </ChakraText>
                                </FormErrorMessage>
                            )}
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button
                            colorScheme="blue"
                            onClick={submit}
                            isDisabled={filterName.trim() === '' || !filterStringIsValid}
                        >
                            {alreadyIncluded ? 'Replace' : 'Add'}
                        </Button>
                        <Button colorScheme="red" onClick={close}>
                            Cancel
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
