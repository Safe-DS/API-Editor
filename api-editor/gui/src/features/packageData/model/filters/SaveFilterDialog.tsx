import {
    Code,
    Button,
    FormControl,
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
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
} from '@chakra-ui/react';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import {
    addFilter,
    selectFilterList,
    selectFilterName,
    selectFilterString,
    setFilterName,
    toggleAddFilterDialog,
} from '../../../ui/uiSlice';

export const SaveFilterDialog: React.FC = function () {
    const dispatch = useAppDispatch();
    const filter = useAppSelector(selectFilterString);
    const name = useAppSelector(selectFilterName);
    const savedFilters = useAppSelector(selectFilterList);

    const alreadyIncluded: boolean = savedFilters.some((it) => {
        return it.name === name;
    });

    const submit = () => {
        dispatch(addFilter({ filter, name }));
        dispatch(setFilterName(''));
        dispatch(toggleAddFilterDialog());
    };
    const close = () => {
        dispatch(toggleAddFilterDialog());
        dispatch(setFilterName(''));
    };

    return (
        <Modal onClose={close} isOpen size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading>Save Filter</Heading>
                </ModalHeader>
                <ModalBody>
                    <FormLabel>
                        Name for the current filter <Code>{filter}</Code>
                    </FormLabel>

                    <FormControl>
                        <Popover
                            returnFocusOnClose={false}
                            isOpen={alreadyIncluded}
                            placement="bottom"
                            closeOnBlur={false}
                            autoFocus={false}
                        >
                            <PopoverTrigger>
                                <Input
                                    id="name_input"
                                    type="text"
                                    value={name}
                                    onChange={(event) => dispatch(setFilterName(event.target.value))}
                                    placeholder="Name"
                                />
                            </PopoverTrigger>
                            {alreadyIncluded && (
                                <PopoverContent minWidth={462} fontSize="sm" marginRight={2}>
                                    <PopoverArrow />
                                    <PopoverHeader>Invalid name</PopoverHeader>
                                    <PopoverBody>The name entered is already assigned to the saved filters</PopoverBody>
                                </PopoverContent>
                            )}
                        </Popover>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={submit} isDisabled={alreadyIncluded}>
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
