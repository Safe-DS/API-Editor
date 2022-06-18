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
import { useAppDispatch } from '../../app/hooks';
import { StyledDropzone } from '../../common/StyledDropzone';
import { isValidJsonFile } from '../../common/util/validation';
import { AnnotationStore, initialAnnotationStore, mergeAnnotations, setAnnotations } from './annotationSlice';
import { hideAnnotationImportDialog, toggleAnnotationImportDialog } from '../ui/uiSlice';

export const AnnotationImportDialog: React.FC = function () {
    const [fileName, setFileName] = useState('');
    const [newAnnotationStore, setNewAnnotationStore] = useState<AnnotationStore>(initialAnnotationStore);
    const dispatch = useAppDispatch();

    const merge = () => {
        if (fileName) {
            dispatch(mergeAnnotations(newAnnotationStore));
        }
        dispatch(hideAnnotationImportDialog());
    };
    const replace = () => {
        if (fileName) {
            dispatch(setAnnotations(newAnnotationStore));
        }
        dispatch(hideAnnotationImportDialog());
    };
    const close = () => dispatch(toggleAnnotationImportDialog());

    const onDrop = (acceptedFiles: File[]) => {
        if (isValidJsonFile(acceptedFiles[acceptedFiles.length - 1].name)) {
            if (acceptedFiles.length > 1) {
                // eslint-disable-next-line no-param-reassign
                acceptedFiles = [acceptedFiles[acceptedFiles.length - 1]];
            }
            setFileName(acceptedFiles[0].name);
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const readAnnotationJson = JSON.parse(reader.result) as AnnotationStore;
                    setNewAnnotationStore(readAnnotationJson);
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
                    <Heading>Import Annotations</Heading>
                </ModalHeader>
                <ModalBody>
                    <FormControl>
                        <FormLabel>
                            Select an annotation file to import. This data will be stored until another annotation file
                            is imported.
                        </FormLabel>
                        <StyledDropzone onDrop={onDrop}>
                            <ChakraText>Drag and drop an annotation file here or click to select the file.</ChakraText>
                            <ChakraText>(only *.json will be accepted)</ChakraText>
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
                        <Button colorScheme="blue" onClick={merge}>
                            Merge into Existing
                        </Button>
                        <Button colorScheme="gray" onClick={replace}>
                            Replace Existing
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
