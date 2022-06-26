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
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { StyledDropzone } from '../../common/StyledDropzone';
import { isValidJsonFile } from '../../common/util/validation';
import { resetAnnotationStore } from '../annotations/annotationSlice';
import { parsePythonPackageJson, PythonPackageJson } from './model/PythonPackageBuilder';
import { resetUIAfterAPIImport, toggleAPIImportDialog } from '../ui/uiSlice';
import { persistPythonPackage, setPythonPackage } from './apiSlice';
import { resetUsages } from '../usages/usageSlice';

export const PackageDataImportDialog: React.FC = function () {
    const toast = useToast();
    const [fileName, setFileName] = useState('');
    const [newPythonPackageString, setNewPythonPackageString] = useState<string>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const submit = async () => {
        if (newPythonPackageString) {
            const pythonPackageJson = JSON.parse(newPythonPackageString) as PythonPackageJson;
            const pythonPackage = parsePythonPackageJson(pythonPackageJson);
            if (pythonPackage) {
                dispatch(setPythonPackage(pythonPackage));
                dispatch(persistPythonPackage(pythonPackageJson));

                // Reset other slices
                dispatch(resetAnnotationStore());
                dispatch(resetUsages());
                dispatch(resetUIAfterAPIImport());
                navigate('/');
            } else {
                toast({
                    title: 'Old API File',
                    description: 'This file is not compatible with the current version of the API Editor.',
                    status: 'error',
                    duration: 4000,
                });
            }
        }
    };
    const close = () => dispatch(toggleAPIImportDialog());

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
                    setNewPythonPackageString(reader.result);
                    dispatch(resetAnnotationStore());
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
                    <Heading>Import API Data</Heading>
                </ModalHeader>
                <ModalBody>
                    <FormControl>
                        <FormLabel>
                            Select an API data file to import. This data will be stored until another API data file is
                            imported.
                        </FormLabel>
                        <StyledDropzone onDrop={slurpAndParse}>
                            <ChakraText>Drag and drop an API data file here or click to select the file.</ChakraText>
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
