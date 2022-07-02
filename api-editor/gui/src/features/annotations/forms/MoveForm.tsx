import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { moduleNamePattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectMoveAnnotation, upsertMove } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface MoveFormProps {
    readonly target: PythonDeclaration;
}

interface MoveFormState {
    destination: string;
}

export const MoveForm: React.FC<MoveFormProps> = function ({ target }) {
    const targetPath = target.id;
    const prevDestination = useAppSelector(selectMoveAnnotation(targetPath))?.destination;
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
            destination: prevDestination || oldModulePath,
        });
    }, [reset, prevDestination, oldModulePath]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: MoveFormState) => {
        dispatch(
            upsertMove({
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
            heading={`${prevDestination ? 'Edit' : 'Add'} @move Annotation`}
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
        </AnnotationForm>
    );
};
