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
import { moduleNamePattern } from '../../../common/validation';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {
    hideAnnotationForms,
    selectMove,
    upsertMove,
} from '../annotationSlice';
import {AnnotationForm} from './AnnotationForm';

interface MoveFormProps {
    readonly target: PythonDeclaration;
}

interface MoveFormState {
    destination: string;
}

export const MoveForm: React.FC<MoveFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();
    const prevDestination = useAppSelector(selectMove(targetPath))?.destination;
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
        setFocus('destination');
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
        dispatch(hideAnnotationForms());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForms());
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${prevDestination ? 'Edit' : 'Add'} @move annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.destination)}>
                <FormLabel>
                    Destination module name for &quot;{target.name}&quot;:
                </FormLabel>
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
