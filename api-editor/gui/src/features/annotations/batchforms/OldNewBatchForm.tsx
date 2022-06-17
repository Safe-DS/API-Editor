import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    FormLabel,
    Heading,
    Input,
    ListItem,
    UnorderedList,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface OldNewBatchFormProps {
    targets: PythonDeclaration[];
    annotationType: string;
    onUpsertAnnotation: (data: OldNewBatchFormState) => void;
}

export interface OldNewBatchFormState {
    oldString: string;
    newString: string;
}

export const OldNewBatchForm: React.FC<OldNewBatchFormProps> = function ({
    targets,
    annotationType,
    onUpsertAnnotation,
}) {
    const dispatch = useAppDispatch();

    const { handleSubmit, register } = useForm<OldNewBatchFormState>({
        defaultValues: {
            oldString: '',
            newString: '',
        },
    });

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    let [data, setData] = useState<OldNewBatchFormState>({ oldString: '', newString: '' });

    // Event handlers ----------------------------------------------------------

    const handleSave = (annotationData: OldNewBatchFormState) => {
        onUpsertAnnotation({ ...annotationData });

        setConfirmWindowVisible(false);
        dispatch(hideAnnotationForm());
    };

    const handleConfirm = (newData: OldNewBatchFormState) => {
        setData(newData);
        setConfirmWindowVisible(true);
    };

    const handleCancel = () => {
        dispatch(hideAnnotationForm());
    };
    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <>
            <AnnotationBatchForm
                heading={`Add @${annotationType} annotation`}
                onConfirm={handleSubmit(handleConfirm)}
                onCancel={handleCancel}
            >
                <FormLabel>String to be replaced:</FormLabel>
                <Input
                    {...register('oldString', {
                        required: 'This is required.',
                    })}
                />

                <FormLabel>Replacement String:</FormLabel>
                <Input
                    {...register('newString', {
                        required: 'This is required.',
                    })}
                />
                <FormLabel>This will annotate classes, functions, and parameters.</FormLabel>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    targets={targets}
                    data={data}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};

interface ConfirmAnnotationsProps {
    targets: PythonDeclaration[];
    data: OldNewBatchFormState;
    handleSave: () => void;
    setConfirmVisible: (visible: boolean) => void;
}

const ConfirmAnnotations: React.FC<ConfirmAnnotationsProps> = function ({
    targets,
    data,
    handleSave,
    setConfirmVisible,
}) {
    const handleCancel = () => {
        setConfirmVisible(false);
        hideAnnotationForm();
    };

    const useCancelRef = useRef(null);

    const filteredTargets = targets.filter((t) => t.name !== t.name.replace(data.oldString, data.newString));

    return (
        <AlertDialog
            isOpen={true}
            leastDestructiveRef={useCancelRef}
            onClose={handleCancel}
            size={'xl'}
            scrollBehavior={'inside'}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading>This will annotate these {filteredTargets.length} items</Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <UnorderedList>
                            {filteredTargets.map((target) => (
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
