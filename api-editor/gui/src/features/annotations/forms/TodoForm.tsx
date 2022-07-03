import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectTodoAnnotation, upsertTodoAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface TodoFormProps {
    readonly target: PythonDeclaration;
}

interface TodoFormState {
    newTodo: string;
    comment: string;
}

export const TodoForm: React.FC<TodoFormProps> = function ({ target }) {
    const targetPath = target.id;
    const previousAnnotation = useAppSelector(selectTodoAnnotation(targetPath));

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<TodoFormState>({
        defaultValues: {
            newTodo: '',
            comment: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('newTodo');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            newTodo: previousAnnotation?.newTodo ?? '',
            comment: previousAnnotation?.comment ?? '',
        });
    }, [reset, previousAnnotation]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: TodoFormState) => {
        dispatch(
            upsertTodoAnnotation({
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
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @todo Annotation`}
            description="Note additional (manual) changes you need to make to this declaration."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.newTodo)}>
                <FormLabel>New todo for "{target.name}":</FormLabel>
                <Textarea
                    {...register('newTodo', {
                        required: 'This is required.',
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.newTodo?.message}
                </FormErrorMessage>
            </FormControl>

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')} />
            </FormControl>
        </AnnotationForm>
    );
};
