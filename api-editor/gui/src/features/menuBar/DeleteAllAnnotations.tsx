import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Heading,
    MenuItem,
    Text as ChakraText,
    VStack,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
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
            <MenuItem onClick={() => setIsOpen(true)} paddingLeft={8} disabled={!usernameIsValid} icon={<FaTrash />}>
                Delete All Annotations
            </MenuItem>

            <AlertDialog isOpen={isOpen && usernameIsValid} leastDestructiveRef={cancelRef} onClose={handleCancel}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <Heading>Delete All Annotations</Heading>
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <VStack alignItems="flexStart">
                                <ChakraText>
                                    <strong>Are you sure?</strong>
                                </ChakraText>
                                <ChakraText>
                                    Hint: Consider exporting your work first by selecting "File &gt; Export &gt;
                                    Annotations" in the menu bar.
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
