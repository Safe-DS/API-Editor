import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { booleanPattern, numberPattern } from '../../../common/validation';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {
    hideAnnotationForms,
    selectOptional,
    upsertOptional,
} from '../annotationSlice';
import AnnotationForm from './AnnotationForm';

interface OptionalFormProps {
    target: PythonDeclaration;
}

interface OptionalFormState {
    defaultValue: string | number | boolean;
    defaultType: string;
}

const OptionalForm: React.FC<OptionalFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();

    // Hooks -----------------------------------------------------------------------------------------------------------
    const optionalDefinition = useAppSelector(selectOptional(targetPath));
    const prevDefaultType = optionalDefinition?.defaultType;
    const prevDefaultValue = optionalDefinition?.defaultValue;
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<OptionalFormState>({
        defaultValues: {
            defaultType: 'string',
            defaultValue: '',
        },
    });

    const defaultTypeRegister = register('defaultType', {
        required: 'This is required.',
    });
    const watchDefaultType = watch('defaultType');

    useEffect(() => {
        reset({
            defaultType: prevDefaultType || 'string',
            defaultValue: prevDefaultValue || '',
        });
    }, [reset, prevDefaultType, prevDefaultValue]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: OptionalFormState) => {
        dispatch(
            upsertOptional({
                target: targetPath,
                ...data,
            }),
        );
        dispatch(hideAnnotationForms());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForms());
    };

    /**
     * Adds functionality to onChange method while preserving original onChange
     * logic from register method
     */
    const registerOnChange = defaultTypeRegister.onChange;
    defaultTypeRegister.onChange = (event) => {
        const result = registerOnChange(event);
        reset({
            defaultType: event.target.value,
            defaultValue: '',
        });
        return result;
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${
                optionalDefinition ? 'Edit' : 'Add'
            } @optional annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormLabel>
                Type of default value of &quot;{target.name}&quot;:
            </FormLabel>
            <Select {...defaultTypeRegister}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
            </Select>
            <FormControl isInvalid={Boolean(errors?.defaultValue)}>
                <FormLabel>
                    Default value for &quot;{target.name}&quot;:
                </FormLabel>
                {watchDefaultType === 'string' && (
                    <Input
                        {...register('defaultValue', {
                            required: 'This is required.',
                        })}
                    />
                )}
                {watchDefaultType === 'number' && (
                    <NumberInput>
                        <NumberInputField
                            {...register('defaultValue', {
                                required: 'This is required.',
                                pattern: numberPattern,
                            })}
                        />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                )}
                {watchDefaultType === 'boolean' && (
                    <Select
                        {...register('defaultValue', {
                            required: 'This is required.',
                            pattern: booleanPattern,
                        })}
                    >
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </Select>
                )}
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.defaultValue?.message}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    );
};

export default OptionalForm;
