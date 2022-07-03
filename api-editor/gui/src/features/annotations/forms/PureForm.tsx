import { FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectPureAnnotation, upsertPureAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface PureFormProps {
    readonly target: PythonDeclaration;
}

interface PureFormState {
    comment: string;
}

export const PureForm: React.FC<PureFormProps> = function ({ target }) {
    const previousAnnotation = useAppSelector(selectPureAnnotation(target.id));

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const { register, handleSubmit, setFocus, reset } = useForm<PureFormState>({
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

    const onSave = (data: PureFormState) => {
        dispatch(
            upsertPureAnnotation({
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
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @pure Annotation`}
            description="Mark this function as pure. This denotes that it has no side effects and that it always produces the same outputs for the same inputs."
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
