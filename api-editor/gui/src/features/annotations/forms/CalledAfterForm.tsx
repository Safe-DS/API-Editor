import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Select } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { hideAnnotationForms, selectCalledAfters, upsertCalledAfter } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import PythonFunction from '../../packageData/model/PythonFunction';

interface CalledAfterFormProps {
    readonly target: PythonFunction;
}

interface CalledAfterFormState {
    calledAfterName: string;
}

export const CalledAfterForm: React.FC<CalledAfterFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();
    const currentCalledAfters = Object.keys(useAppSelector(selectCalledAfters(targetPath)));

    const remainingCalledAfters = target
        .siblingFunctions()
        .map((it) => it.name)
        .filter((it) => !currentCalledAfters.includes(it));

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
        <AnnotationForm heading={`@calledAfter annotation`} onSave={handleSubmit(onSave)} onCancel={onCancel}>
            <FormControl isInvalid={Boolean(errors?.calledAfterName)}>
                <FormLabel>Name of the callable to be called before:</FormLabel>
                <Select
                    {...register('calledAfterName', {
                        required: 'This is required.',
                    })}
                >
                    {remainingCalledAfters?.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </Select>
                <FormErrorMessage>
                    <FormErrorIcon /> {errors?.calledAfterName?.message}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    );
};
