import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectValueAnnotation, upsertValue } from '../annotationSlice';
import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Radio,
    RadioGroup,
    Select,
    Stack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Optional } from '../../../common/util/types';
import { booleanPattern, numberPattern } from '../../../common/validation';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import {DefaultValue, DefaultValueType} from "../versioning/AnnotationStoreV2";

interface ValueFormProps {
    target: PythonDeclaration;
}

export const ValueForm: React.FC<ValueFormProps> = function ({ target }) {
    // Hooks -----------------------------------------------------------------------------------------------------------
    const valueAnnotation = useAppSelector(selectValueAnnotation(target.id));
    const previousDefaultType = valueAnnotation?.defaultValueType;
    const previousDefaultValue = valueAnnotation?.defaultValue;
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueFormState) => {
        dispatch(
            upsertValue({
                target: target.id,
                ...data,
            }),
        );
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueForm
            target={target}
            annotationType="optional"
            description="Make this parameter optional and set its default value."
            previousDefaultType={previousDefaultType}
            previousDefaultValue={previousDefaultValue}
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};

interface TypeValueFormProps {
    target: PythonDeclaration;
    annotationType: string;
    description: string;
    previousDefaultType: Optional<DefaultValueType>;
    previousDefaultValue: Optional<DefaultValue>;
    onUpsertAnnotation: (data: TypeValueFormState) => void;
}

export interface TypeValueFormState {
    defaultValueType: DefaultValueType;
    defaultValue: DefaultValue;
}

const TypeValueForm: React.FC<TypeValueFormProps> = function ({
    target,
    annotationType,
    description,
    previousDefaultType,
    previousDefaultValue,
    onUpsertAnnotation,
}) {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        register,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TypeValueFormState>({
        defaultValues: {
            defaultValueType: 'string',
            defaultValue: '',
        },
    });

    const watchDefaultType = watch('defaultValueType');

    useEffect(() => {
        reset({
            defaultValueType: previousDefaultType || 'string',
            defaultValue: previousDefaultValue || '',
        });
    }, [reset, previousDefaultType, previousDefaultValue]);

    // Event handlers ----------------------------------------------------------

    const handleTypeChange = (newType: DefaultValueType) => {
        setValue('defaultValueType', newType);
        reset({
            defaultValueType: newType,
            defaultValue: '',
        });
    };

    const handleSave = (data: TypeValueFormState) => {
        let toUpsert = { ...data };
        if (data.defaultValueType === 'boolean') {
            toUpsert = { ...data, defaultValue: data.defaultValue === 'true' };
        } else if (data.defaultValueType === 'none') {
            toUpsert = { ...data, defaultValue: null };
        }
        onUpsertAnnotation(toUpsert);
        dispatch(hideAnnotationForm());
    };

    const handleCancel = () => {
        dispatch(hideAnnotationForm());
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${previousDefaultType ? 'Edit' : 'Add'} @${annotationType} Annotation`}
            description={description}
            onSave={handleSubmit(handleSave)}
            onCancel={handleCancel}
        >
            <FormLabel>Type of default value of &quot;{target.name}&quot;:</FormLabel>
            <RadioGroup defaultValue={previousDefaultType || 'string'} onChange={handleTypeChange}>
                <Stack direction="column">
                    <Radio value="string">String</Radio>
                    <Radio value="number">Number</Radio>
                    <Radio value="boolean">Boolean</Radio>
                    <Radio value="none">None</Radio>
                </Stack>
            </RadioGroup>

            {watchDefaultType !== 'none' && (
                <FormControl isInvalid={Boolean(errors?.defaultValue)}>
                    <FormLabel>Default value for &quot;{target.name}&quot;:</FormLabel>
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
            )}
        </AnnotationForm>
    );
};
