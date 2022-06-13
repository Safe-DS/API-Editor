import { FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectDescription, upsertDescription } from '../annotationSlice';
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
            newDescription: prevNewDescription ?? oldDescription,
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
            <FormControl>
                <FormLabel>New description for "{target.name}":</FormLabel>
                <Textarea {...register('newDescription')} />
            </FormControl>
        </AnnotationForm>
    );
};
