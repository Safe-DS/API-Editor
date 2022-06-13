import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { pythonIdentifierPattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectDescription, upsertDescription } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface DescriptionFormProps {
    readonly target: PythonDeclaration;
}

interface DescriptionFormState {
    newDescription: string;
}

export const DescriptionForm: React.FC<DescriptionFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();
    const prevNewDescription = useAppSelector(selectDescription(targetPath))?.newDescription;
    const oldDescription = target.description;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<DescriptionFormState>({
        defaultValues: {
            newDescription: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('newDescription');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            newDescription: prevNewDescription || oldDescription,
        });
    }, [reset, prevNewDescription, oldDescription]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: DescriptionFormState) => {
        dispatch(
            upsertDescription({
                target: targetPath,
                ...data,
            }),
        );
        dispatch(hideAnnotationForm());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForm());
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${prevNewDescription ? 'Edit' : 'Add'} @description annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.newDescription)}>
                <FormLabel>New description for &quot;{oldDescription}&quot;:</FormLabel>
                <Input
                    {...register('newDescription', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.newDescription?.message}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    );
};
