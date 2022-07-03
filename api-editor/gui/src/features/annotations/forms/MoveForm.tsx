import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { moduleNamePattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectMoveAnnotation, upsertMoveAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface MoveFormProps {
    readonly target: PythonDeclaration;
}

interface MoveFormState {
    destination: string;
    comment: string;
}

export const MoveForm: React.FC<MoveFormProps> = function ({ target }) {
    const targetPath = target.id;
    const previousAnnotation = useAppSelector(selectMoveAnnotation(targetPath));
    const oldModulePath = target?.parent()?.name;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<MoveFormState>({
        defaultValues: {
            destination: '',
            comment: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('destination');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            destination: previousAnnotation?.destination ?? oldModulePath,
            comment: previousAnnotation?.comment ?? '',

        });
    }, [reset, previousAnnotation, oldModulePath]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: MoveFormState) => {
        dispatch(
            upsertMoveAnnotation({
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
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @move Annotation`}
            description="Move this global declaration to another module."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.destination)}>
                <FormLabel>Destination module name for &quot;{target.name}&quot;:</FormLabel>
                <Input
                    {...register('destination', {
                        required: 'This is required.',
                        pattern: moduleNamePattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.destination?.message}
                </FormErrorMessage>
            </FormControl>

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')}/>
            </FormControl>
        </AnnotationForm>
    );
};
