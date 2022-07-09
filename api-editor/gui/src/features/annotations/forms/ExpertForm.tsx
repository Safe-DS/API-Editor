import { FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectExpertAnnotation, upsertExpertAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface ExpertFormProps {
    readonly target: PythonDeclaration;
}

interface ExpertFormState {
    comment: string;
}

export const ExpertForm: React.FC<ExpertFormProps> = function ({ target }) {
    const previousAnnotation = useAppSelector(selectExpertAnnotation(target.id));

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const { register, handleSubmit, setFocus, reset } = useForm<ExpertFormState>({
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

    const onSave = (data: ExpertFormState) => {
        dispatch(
            upsertExpertAnnotation({
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
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @expert Annotation`}
            description="Indicate that this API element should only be used by expert users."
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
