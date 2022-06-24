import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { ConfirmAnnotations } from './ConfirmAnnotations';

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

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<OldNewBatchFormState>({
        defaultValues: {
            oldString: '',
            newString: '',
        },
    });

    const [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    const [data, setData] = useState<OldNewBatchFormState>({ oldString: '', newString: '' });

    const filteredTargets = targets.filter((t) => t.name !== t.name.replace(data.oldString, data.newString));

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
                heading={`Add @${annotationType} Annotations`}
                onConfirm={handleSubmit(handleConfirm)}
                onCancel={handleCancel}
            >
                <FormControl isInvalid={Boolean(errors.oldString)}>
                    <FormLabel>String to be replaced:</FormLabel>
                    <Input
                        {...register('oldString', {
                            required: 'This is required.',
                        })}
                    />
                    <FormErrorMessage>
                        <FormErrorIcon /> {errors.oldString?.message}
                    </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.newString)}>
                    <FormLabel>Replacement String:</FormLabel>
                    <Input
                        {...register('newString', {
                            required: 'This is required.',
                        })}
                    />
                    <FormErrorMessage>
                        <FormErrorIcon /> {errors.newString?.message}
                    </FormErrorMessage>
                </FormControl>

                <FormLabel>This will annotate classes, functions, and parameters.</FormLabel>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    targets={filteredTargets}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
