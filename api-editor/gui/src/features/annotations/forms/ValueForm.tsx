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
import { DefaultValue, DefaultValueType, ValueAnnotationVariant } from '../versioning/AnnotationStoreV2';

interface ValueFormProps {
    target: PythonDeclaration;
}

export const ValueForm: React.FC<ValueFormProps> = function ({ target }) {
    // Hooks -----------------------------------------------------------------------------------------------------------
    const valueAnnotation = useAppSelector(selectValueAnnotation(target.id));
    const previousVariant = valueAnnotation?.variant;
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
            annotationType="value"
            description="Change how the value of this parameter is set."
            previousVariant={previousVariant}
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
    previousVariant: Optional<ValueAnnotationVariant>;
    previousDefaultType: Optional<DefaultValueType>;
    previousDefaultValue: Optional<DefaultValue>;
    onUpsertAnnotation: (data: TypeValueFormState) => void;
}

export interface TypeValueFormState {
    variant: ValueAnnotationVariant;
    defaultValueType: DefaultValueType;
    defaultValue: DefaultValue;
}

const TypeValueForm: React.FC<TypeValueFormProps> = function ({
    target,
    annotationType,
    description,
    previousVariant,
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
            variant: 'optional',
            defaultValueType: 'string',
            defaultValue: '',
        },
    });

    const watchVariant = watch('variant');
    const watchDefaultType = watch('defaultValueType');

    useEffect(() => {
        const defaultValueType = previousDefaultType ?? 'string';

        let defaultValue: string;
        if (previousDefaultValue === undefined) {
            defaultValue = '';
        } else {
            if (defaultValueType === 'boolean') {
                defaultValue = previousDefaultValue ? 'true' : 'false';
            } else {
                defaultValue = String(previousDefaultValue);
            }
        }

        reset({
            variant: previousVariant ?? 'optional',
            defaultValueType,
            defaultValue,
        });
    }, [reset, previousVariant, previousDefaultType, previousDefaultValue]);

    // Event handlers ----------------------------------------------------------

    const handleVariantChange = (newVariant: ValueAnnotationVariant) => {
        setValue('variant', newVariant);
    };

    const handleTypeChange = (newType: DefaultValueType) => {
        setValue('defaultValueType', newType);

        switch (newType) {
            case 'boolean':
                setValue('defaultValue', 'true');
                break;
            case 'number':
                setValue('defaultValue', 0);
                break;
            default:
                setValue('defaultValue', '');
                break;
        }
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
            <FormLabel>Choose the variant of this annotation:</FormLabel>
            <RadioGroup defaultValue={previousVariant ?? 'optional'} onChange={handleVariantChange}>
                <Stack direction="column">
                    <Radio value="required">Required (parameter must always be set explicitly)</Radio>
                    <Radio value="optional">Optional (parameter has a default value that can be overwritten)</Radio>
                    <Radio value="constant">Constant (parameter is replaced by a constant value)</Radio>
                </Stack>
            </RadioGroup>

            {watchVariant !== 'required' && (
                <>
                    {watchVariant === 'optional' && (
                        <FormLabel>Type of default value of &quot;{target.name}&quot;:</FormLabel>
                    )}
                    {watchVariant === 'constant' && (
                        <FormLabel>Type of constant value of &quot;{target.name}&quot;:</FormLabel>
                    )}
                    <RadioGroup defaultValue={previousDefaultType ?? 'string'} onChange={handleTypeChange}>
                        <Stack direction="column">
                            <Radio value="string">String</Radio>
                            <Radio value="number">Number</Radio>
                            <Radio value="boolean">Boolean</Radio>
                            <Radio value="none">None</Radio>
                        </Stack>
                    </RadioGroup>
                </>
            )}

            {watchVariant !== 'required' && watchDefaultType !== 'none' && (
                <FormControl isInvalid={Boolean(errors?.defaultValue)}>
                    {watchVariant === 'optional' && <FormLabel>Default value for &quot;{target.name}&quot;:</FormLabel>}
                    {watchVariant === 'constant' && (
                        <FormLabel>Constant value for &quot;{target.name}&quot;:</FormLabel>
                    )}

                    {watchDefaultType === 'string' && <Input {...register('defaultValue', {})} />}
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
