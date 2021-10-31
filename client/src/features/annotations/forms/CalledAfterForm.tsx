import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Select,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../app/hooks';
import { Optional } from '../../../common/util/types'
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {
    hideAnnotationForms,
    upsertCalledAfter,
} from '../annotationSlice';
import AnnotationForm from './AnnotationForm';

interface CalledAfterFormProps {
    readonly target: PythonDeclaration;
    readonly selectOptions: Optional<string[]>;
}

interface CalledAfterFormState {
    calledAfterName: string;
}

const CalledAfterForm: React.FC<CalledAfterFormProps> = function ({ target, selectOptions }) {
    const targetPath = target.pathAsString();

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
            <FormControl isInvalid={Boolean(errors?.calledAfterName)}>
                <FormLabel>Name of the callable to be called before:</FormLabel>
                <Select
                    {...register('calledAfterName', {
                        required: 'This is required.'
                    })}
                >
                    {selectOptions?.map((name, index) => (
                        <option key={name + index} value={ name }>{ name }</option>
                    ))}
                </Select>
                <FormErrorMessage>
                    <FormErrorIcon /> {errors?.calledAfterName?.message}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    );
};

export default CalledAfterForm;
