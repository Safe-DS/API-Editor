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
import * as idb from 'idb-keyval';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { StyledDropzone } from '../../common/StyledDropzone';
import { Setter } from '../../common/util/types';
import { isValidJsonFile } from '../../common/util/validation';
import { resetAnnotations } from '../annotations/annotationSlice';
import PythonPackage from './model/PythonPackage';
import { parsePythonPackageJson, PythonPackageJson } from './model/PythonPackageBuilder';
import { togglePackageDataImportDialog } from './packageDataSlice';

interface ImportPythonPackageDialogProps {
    setPythonPackage: Setter<PythonPackage>;
    setFilter: Setter<string>;
}

export const PackageDataImportDialog: React.FC<ImportPythonPackageDialogProps> = function ({
    setFilter,
    setPythonPackage,
}) {
    const [fileName, setFileName] = useState('');
    const [newPythonPackage, setNewPythonPackage] = useState<string>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const submit = async () => {
        if (newPythonPackage) {
            const parsedPythonPackage = JSON.parse(newPythonPackage) as PythonPackageJson;
            setPythonPackage(parsePythonPackageJson(parsedPythonPackage));
            setFilter('is:public');
            navigate('/');

            await idb.set('package', parsedPythonPackage);
        }
        close();
    };
    const close = () => dispatch(togglePackageDataImportDialog());

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
                    setNewPythonPackage(reader.result);
                    dispatch(resetAnnotations());
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
                    <Heading>Import API data</Heading>
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
