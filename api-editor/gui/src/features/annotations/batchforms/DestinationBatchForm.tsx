import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input, Text as ChakraText } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { ConfirmAnnotations } from './ConfirmAnnotations';

interface DestinationBatchFormProps {
    targets: PythonDeclaration[];
    annotationType: string;
    onUpsertAnnotation: (data: DestinationBatchFormState) => void;
}

export interface DestinationBatchFormState {
    destination: string;
}

export const DestinationBatchForm: React.FC<DestinationBatchFormProps> = function ({
    targets,
    annotationType,
    onUpsertAnnotation,
}) {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<DestinationBatchFormState>({
        defaultValues: {
            destination: '',
        },
    });

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    let [data, setData] = useState<DestinationBatchFormState>({ destination: '' });

    // Event handlers ----------------------------------------------------------

    const handleSave = (annotationData: DestinationBatchFormState) => {
        onUpsertAnnotation({ ...annotationData });

        setConfirmWindowVisible(false);
        dispatch(hideAnnotationForm());
    };

    const handleConfirm = (newData: DestinationBatchFormState) => {
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
                <FormControl isInvalid={Boolean(errors?.destination)}>
                    <FormLabel>Destination module:</FormLabel>
                    <Input
                        {...register('destination', {
                            required: 'This is required.',
                        })}
                    />
                    <FormErrorMessage>
                        <FormErrorIcon /> {errors.destination?.message}
                    </FormErrorMessage>
                </FormControl>

                <ChakraText>This will annotate classes and global functions.</ChakraText>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    targets={targets}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
