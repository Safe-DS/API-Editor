import { FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectRemoveAnnotation, upsertRemoveAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface RemoveFormProps {
    readonly target: PythonDeclaration;
}

interface RemoveFormState {
    comment: string;
}

export const RemoveForm: React.FC<RemoveFormProps> = function ({ target }) {
    const previousAnnotation = useAppSelector(selectRemoveAnnotation(target.id));

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const { register, handleSubmit, setFocus, reset } = useForm<RemoveFormState>({
        defaultValues: {
            comment: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('comment');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            comment: previousAnnotation?.comment ?? '',
        });
    }, [reset, previousAnnotation]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: RemoveFormState) => {
        dispatch(
            upsertRemoveAnnotation({
                target: target.id,
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
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @remove Annotation`}
            description="Remove this declaration."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')} />
            </FormControl>
        </AnnotationForm>
    );
};
