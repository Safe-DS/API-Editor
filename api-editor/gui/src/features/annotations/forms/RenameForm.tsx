import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { pythonIdentifierPattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectRenameAnnotation, upsertRenameAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface RenameFormProps {
    readonly target: PythonDeclaration;
}

interface RenameFormState {
    newName: string;
    comment: string;
}

export const RenameForm: React.FC<RenameFormProps> = function ({ target }) {
    const targetPath = target.id;
    const previousAnnotation = useAppSelector(selectRenameAnnotation(targetPath));
    const oldName = target.name;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<RenameFormState>({
        defaultValues: {
            newName: '',
            comment: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('newName');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            newName: previousAnnotation?.newName ?? oldName,
            comment: previousAnnotation?.comment ?? '',
        });
    }, [reset, previousAnnotation, oldName]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: RenameFormState) => {
        dispatch(
            upsertRenameAnnotation({
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
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @rename Annotation`}
            description="Change the name of this declaration."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.newName)}>
                <FormLabel>New name for &quot;{oldName}&quot;:</FormLabel>
                <Input
                    {...register('newName', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.newName?.message}
                </FormErrorMessage>
            </FormControl>

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')}/>
            </FormControl>
        </AnnotationForm>
    );
};
