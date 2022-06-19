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
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addFilter, selectFilterList, selectFilterString, toggleAddFilterDialog } from '../ui/uiSlice';

export const SaveFilterDialog: React.FC = function () {
    const dispatch = useAppDispatch();
    const filter = useAppSelector(selectFilterString);
    const savedFilters = useAppSelector(selectFilterList);
    const [filterName, setFilterName] = useState('');

    const alreadyIncluded: boolean = savedFilters.some((it) => {
        return it.name === filterName;
    });

    const submit = () => {
        if (filterName !== '' && !alreadyIncluded) {
            dispatch(addFilter({ filter, name: filterName }));
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
                    <FormControl isInvalid={alreadyIncluded || filterName.trim() === ''}>
                        <FormLabel htmlFor="newFilterName">
                            Name for the current filter <Code>{filter}</Code>:
                        </FormLabel>
                        <Input
                            type="text"
                            id="newFilterName"
                            value={filterName}
                            onChange={(event) => setFilterName(event.target.value)}
                            spellCheck={false}
                        />
                        {alreadyIncluded && (
                            <FormErrorMessage>A filter with this name is saved already.</FormErrorMessage>
                        )}
                        {filterName.trim() === '' && (
                            <FormErrorMessage>The filter name must not be blank.</FormErrorMessage>
                        )}
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button
                            colorScheme="blue"
                            onClick={submit}
                            isDisabled={alreadyIncluded || filterName.trim() === ''}
                        >
                            Submit
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
