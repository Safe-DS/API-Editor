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
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import { StyledDropzone } from '../../common/StyledDropzone';
import { isValidJsonFile } from '../../common/util/validation';
import { UsageCountJson, UsageCountStore } from './model/UsageCountStore';
import { toggleUsageImportDialog } from '../ui/uiSlice';
import { setUsages } from './usageSlice';
import {selectPythonPackage} from "../packageData/apiSlice";

export const UsageImportDialog: React.FC = function () {
    const [fileName, setFileName] = useState('');
    const [newUsages, setNewUsages] = useState<string>();
    const dispatch = useAppDispatch();
    const api = useAppSelector(selectPythonPackage);

    const submit = async () => {
        if (newUsages) {
            const parsedUsages = JSON.parse(newUsages) as UsageCountJson;
            dispatch(setUsages(UsageCountStore.fromJson(parsedUsages, api)));
        }
        close();
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
                    <Heading>Import usages</Heading>
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
