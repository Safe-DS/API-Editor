import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Textarea } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectTodo, upsertTodo } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface TodoFormProps {
    readonly target: PythonDeclaration;
}

interface TodoFormState {
    newTodo: string;
}

export const TodoForm: React.FC<TodoFormProps> = function ({ target }) {
    const targetPath = target.id;
    const prevNewTodo = useAppSelector(selectTodo(targetPath))?.newTodo;

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
            newTodo: prevNewTodo ?? '',
        });
    }, [reset, prevNewTodo]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: TodoFormState) => {
        dispatch(
            upsertTodo({
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
            heading={`${prevNewTodo ? 'Edit' : 'Add'} @todo Annotation`}
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
        </AnnotationForm>
    );
};
