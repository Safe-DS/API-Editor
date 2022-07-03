import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Select, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCalledAfterAnnotations, upsertCalledAfterAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface CalledAfterFormProps {
    readonly target: PythonFunction;
}

interface CalledAfterFormState {
    calledAfterName: string;
    comment: string;
}

export const CalledAfterForm: React.FC<CalledAfterFormProps> = function ({ target }) {
    const targetPath = target.id;
    const currentCalledAfters = Object.keys(useAppSelector(selectCalledAfterAnnotations(targetPath)));

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
            comment: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('calledAfterName');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            calledAfterName: '',
            comment: '',
        });
    }, [reset]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: CalledAfterFormState) => {
        dispatch(
            upsertCalledAfterAnnotation({
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
            heading="@calledAfter Annotation"
            description="Specify that this function must be called after another function."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
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

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')}/>
            </FormControl>
        </AnnotationForm>
    );
};
