import { FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectDescriptionAnnotation, upsertDescriptionAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonParameter } from '../../packageData/model/PythonParameter';

interface DescriptionFormProps {
    readonly target: PythonClass | PythonFunction | PythonParameter;
}

interface DescriptionFormState {
    newDescription: string;
    comment: string;
}

export const DescriptionForm: React.FC<DescriptionFormProps> = function ({ target }) {
    const targetPath = target.id;
    const previousAnnotation = useAppSelector(selectDescriptionAnnotation(targetPath));
    const oldDescription = target.description;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const { register, handleSubmit, setFocus, reset } = useForm<DescriptionFormState>({
        defaultValues: {
            newDescription: '',
            comment: '',
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
            newDescription: previousAnnotation?.newDescription ?? oldDescription,
            comment: previousAnnotation?.comment ?? '',
        });
    }, [reset, previousAnnotation, oldDescription]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: DescriptionFormState) => {
        dispatch(
            upsertDescriptionAnnotation({
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
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @description Annotation`}
            description="Change the description of this declaration."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl>
                <FormLabel>New description for "{target.name}":</FormLabel>
                <Textarea {...register('newDescription')} />
            </FormControl>

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')}/>
            </FormControl>
        </AnnotationForm>
    );
};
