import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Heading,
    Input,
    VStack,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectAnnotations } from '../features/annotations/annotationSlice';
import { AnnotatedPythonPackageBuilder } from '../features/annotatedPackageData/model/AnnotatedPythonPackageBuilder';
import { selectRawPythonPackage } from '../features/packageData/apiSlice';

interface GenerateAdaptersProps {
    displayInferErrors: (errors: string[]) => void;
}

export const GenerateAdapters: React.FC<GenerateAdaptersProps> = function ({ displayInferErrors }) {
    const [isOpen, setIsOpen] = useState(false);
    const [newPackageName, setNewPackageName] = useState('');
    const [shouldValidate, setShouldValidate] = useState(false);
    const cancelRef = useRef(null);

    const annotationStore = useAppSelector(selectAnnotations);
    const pythonPackage = useAppSelector(selectRawPythonPackage);

    const packageNameIsValid = !shouldValidate || newPackageName !== '';

    // Event handlers ----------------------------------------------------------

    const handleConfirm = () => {
        if (newPackageName !== '') {
            generateAdapters();
            setIsOpen(false);
            setShouldValidate(false);
        } else {
            setShouldValidate(true);
        }
    };
    const handleCancel = () => {
        setIsOpen(false);
        setShouldValidate(false);
    };

    const generateAdapters = () => {
        const annotatedPythonPackageBuilder = new AnnotatedPythonPackageBuilder(pythonPackage, annotationStore);
        const annotatedPythonPackage = annotatedPythonPackageBuilder.generateAnnotatedPythonPackage();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annotatedPythonPackage),
        };
        fetch(`/api-editor/generate-adapters/${newPackageName}`, requestOptions).then(async (response) => {
            if (!response.ok) {
                const jsonResponse = await response.json();
                displayInferErrors(jsonResponse);
            } else {
                const jsonBlob = await response.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(jsonBlob);
                a.download = `${newPackageName}.zip`;
                a.click();
            }
        });
    };

    // Render ------------------------------------------------------------------

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Generate adapters</Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={handleCancel}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Heading>Generate adapters</Heading>
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack alignItems="flexStart">
                                <FormControl isInvalid={!packageNameIsValid}>
                                    <FormLabel htmlFor="newPackageName">New package name:</FormLabel>
                                    <Input
                                        type="text"
                                        id="newPackageName"
                                        value={newPackageName}
                                        onChange={(event) => setNewPackageName(event.target.value)}
                                        spellCheck={false}
                                    />
                                    {packageNameIsValid ? (
                                        <FormHelperText>
                                            Enter the package name for the generated adapters.
                                        </FormHelperText>
                                    ) : (
                                        <FormErrorMessage>Package name is required.</FormErrorMessage>
                                    )}
                                </FormControl>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button colorScheme="blue" onClick={handleConfirm}>
                                Confirm
                            </Button>
                            <Button colorScheme="red" ref={cancelRef} onClick={handleCancel} ml={3}>
                                Cancel
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};
