import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text as ChakraText,
    useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { StyledDropzone } from '../../common/StyledDropzone';
import { isValidJsonFile } from '../../common/util/validation';
import { UsageCountJson, UsageCountStore } from './model/UsageCountStore';
import { toggleUsageImportDialog } from '../ui/uiSlice';
import { setUsages } from './usageSlice';
import { selectRawPythonPackage } from '../packageData/apiSlice';

export const UsageImportDialog: React.FC = function () {
    const toast = useToast();
    const [fileName, setFileName] = useState('');
    const [newUsages, setNewUsages] = useState<string>();
    const dispatch = useAppDispatch();
    const api = useAppSelector(selectRawPythonPackage);

    const submit = async () => {
        if (!fileName) {
            toast({
                title: 'No File Selected',
                description: 'Select a file to import or cancel this dialog.',
                status: 'error',
                duration: 4000,
            });
            return;
        }

        if (newUsages) {
            const parsedUsages = JSON.parse(newUsages) as UsageCountJson;
            const usageCountStore = UsageCountStore.fromJson(parsedUsages, api)
            if (usageCountStore) {
                dispatch(setUsages(usageCountStore));
                close();
            } else {
                toast({
                    title: 'Old Usage Count File',
                    description: 'This file is not compatible with the current version of the API Editor.',
                    status: 'error',
                    duration: 4000,
                })
            }
        }

    };
    const close = () => dispatch(toggleUsageImportDialog());

    const slurpAndParse = (acceptedFiles: File[]) => {
        if (isValidJsonFile(acceptedFiles[acceptedFiles.length - 1].name)) {
            if (acceptedFiles.length > 1) {
                // eslint-disable-next-line no-param-reassign
                acceptedFiles = [acceptedFiles[acceptedFiles.length - 1]];
            }
            setFileName(acceptedFiles[0].name);
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setNewUsages(reader.result);
                }
            };
            reader.readAsText(acceptedFiles[0]);
        }
    };

    return (
        <Modal onClose={close} isOpen size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading>Import Usages</Heading>
                </ModalHeader>
                <ModalBody>
                    <FormControl>
                        <FormLabel>
                            Select a usage file to import. This data will be stored until another usage file is
                            imported.
                        </FormLabel>
                        <StyledDropzone onDrop={slurpAndParse}>
                            <ChakraText>Drag and drop a usage file here or click to select the file.</ChakraText>
                            <ChakraText>(Only *.json will be accepted.)</ChakraText>
                        </StyledDropzone>

                        {fileName && (
                            <Box>
                                <strong>Imported file: </strong>
                                {fileName}
                            </Box>
                        )}
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={submit}>
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
