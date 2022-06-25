import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Heading,
    Text as ChakraText,
    VStack,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { resetAnnotationStore, selectUsernameIsValid } from '../annotations/annotationSlice';

export const DeleteAllAnnotations = function () {
    const dispatch = useAppDispatch();

    const usernameIsValid = useAppSelector(selectUsernameIsValid);

    const [isOpen, setIsOpen] = useState(false);
    const cancelRef = useRef(null);

    // Event handlers ----------------------------------------------------------

    const handleConfirm = () => {
        dispatch(resetAnnotationStore());
        setIsOpen(false);
    };
    const handleCancel = () => setIsOpen(false);

    // Render ------------------------------------------------------------------

    return (
        <>
            <Button onClick={() => setIsOpen(true)} disabled={!usernameIsValid}>
                Delete All Annotations
            </Button>

            <AlertDialog isOpen={isOpen && usernameIsValid} leastDestructiveRef={cancelRef} onClose={handleCancel}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Heading>Delete All Annotations</Heading>
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack alignItems="flexStart">
                                <ChakraText>Are you sure? You can't undo this action afterwards.</ChakraText>
                                <ChakraText>
                                    Hint: Consider exporting your work first by clicking on the "Export" button in the
                                    menu bar.
                                </ChakraText>
                            </VStack>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleConfirm} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};
