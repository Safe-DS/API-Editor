import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Input,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {
    hideAnnotationForms,
    selectCalledAfters,
    upsertCalledAfter,
} from '../annotationSlice';
import AnnotationForm from './AnnotationForm';

interface CalledAfterFormProps {
    readonly target: PythonDeclaration;
}

interface CalledAfterFormState {
    calledAfterName: string;
}

const CalledAfterForm: React.FC<CalledAfterFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();
    const calledAfters = useAppSelector(selectCalledAfters(targetPath));

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<CalledAfterFormState>({
        defaultValues: {
            calledAfterName: '',
        },
    });

    useEffect(() => {
        setFocus('calledAfterName');
    }, [setFocus]);

    useEffect(() => {
        reset({
            calledAfterName: '',
        });
    }, [reset]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: CalledAfterFormState) => {
        dispatch(
            upsertCalledAfter({
                target: targetPath,
                ...data,
            }),
        );
        dispatch(hideAnnotationForms());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForms());
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`@calledAfter annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={false}>
                <FormLabel>Name of the callable to be called before:</FormLabel>
                <Input
                    {...register('calledAfterName')}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors?.calledAfterName && 'This is required'}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    );
};

export default CalledAfterForm;
