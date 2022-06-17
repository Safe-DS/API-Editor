import React, { useRef } from 'react';
import { hideAnnotationForm } from '../../ui/uiSlice';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Heading,
    Text,
} from '@chakra-ui/react';

interface ConfirmAnnotationsProps {
    count: number;
    handleSave: () => void;
    setConfirmVisible: (visible: boolean) => void;
}

export const ConfirmAnnotations: React.FC<ConfirmAnnotationsProps> = function ({
    count,
    handleSave,
    setConfirmVisible,
}) {
    const handleCancel = () => {
        setConfirmVisible(false);
        hideAnnotationForm();
    };

    const useCancelRef = useRef(null);

    return (
        <AlertDialog isOpen={true} leastDestructiveRef={useCancelRef} onClose={handleCancel}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading>Annotate selected items</Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <Text>This will annotate {count} items, are you sure?</Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={useCancelRef} onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button colorScheme="green" onClick={handleSave} ml={3}>
                            Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};
