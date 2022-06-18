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
    ListItem,
    UnorderedList,
} from '@chakra-ui/react';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';

interface ConfirmAnnotationsProps {
    targets: PythonDeclaration[];
    handleSave: () => void;
    setConfirmVisible: (visible: boolean) => void;
}

export const ConfirmAnnotations: React.FC<ConfirmAnnotationsProps> = function ({
    targets,
    handleSave,
    setConfirmVisible,
}) {
    const handleCancel = () => {
        setConfirmVisible(false);
        hideAnnotationForm();
    };

    const useCancelRef = useRef(null);

    return (
        <AlertDialog isOpen={true} leastDestructiveRef={useCancelRef} onClose={handleCancel} scrollBehavior={'inside'}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading>This will annotate these {targets.length} items</Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <UnorderedList>
                            {targets.map((target) => (
                                <ListItem key={target.id}>{target.id}</ListItem>
                            ))}
                        </UnorderedList>
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
