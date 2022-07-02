import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { pythonIdentifierPattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectRenameAnnotation, upsertRenameAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface RenameFormProps {
    readonly target: PythonDeclaration;
}

interface RenameFormState {
    newName: string;
}

export const RenameForm: React.FC<RenameFormProps> = function ({ target }) {
    const targetPath = target.id;
    const prevNewName = useAppSelector(selectRenameAnnotation(targetPath))?.newName;
    const oldName = target.name;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<RenameFormState>({
        defaultValues: {
            newName: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('newName');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            newName: prevNewName || oldName,
        });
    }, [reset, prevNewName, oldName]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: RenameFormState) => {
        dispatch(
            upsertRenameAnnotation({
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
            heading={`${prevNewName ? 'Edit' : 'Add'} @rename Annotation`}
            description="Change the name of this declaration."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.newName)}>
                <FormLabel>New name for &quot;{oldName}&quot;:</FormLabel>
                <Input
                    {...register('newName', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.newName?.message}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    );
};
