import {FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Textarea} from '@chakra-ui/react';
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
    const targetPath = target.pathAsString();
    const prevNewTodo = useAppSelector(selectTodo(targetPath))?.newTodo;
    const oldTodo = target.todo;

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
            newTodo: prevNewTodo ?? oldTodo,
        });
    }, [reset, prevNewTodo, oldTodo]);

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
            heading={`${prevNewTodo ? 'Edit' : 'Add'} @todo annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.newTodo)}>
                <FormLabel>Update todo:</FormLabel>
                <Textarea
                    {...register('newTodo')}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.newTodo?.message}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    );
};
