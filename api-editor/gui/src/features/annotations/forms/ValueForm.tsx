import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectValueAnnotation, upsertValueAnnotation } from '../annotationSlice';
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
    Textarea,
    Tooltip,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Optional } from '../../../common/util/types';
import { booleanPattern, numberPattern } from '../../../common/validation';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import {
    DefaultValue,
    DefaultValueType,
    ValueAnnotation,
    ValueAnnotationVariant,
} from '../versioning/AnnotationStoreV2';
import { PythonParameter } from '../../packageData/model/PythonParameter';

interface ValueFormProps {
    target: PythonParameter;
}

export const ValueForm: React.FC<ValueFormProps> = function ({ target }) {
    // Hooks -----------------------------------------------------------------------------------------------------------
    const previousAnnotation = useAppSelector(selectValueAnnotation(target.id));
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueFormState) => {
        dispatch(
            upsertValueAnnotation({
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
            previousAnnotation={previousAnnotation}
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};

interface TypeValueFormProps {
    target: PythonParameter;
    annotationType: string;
    description: string;
    previousAnnotation: Optional<ValueAnnotation>;
    onUpsertAnnotation: (data: TypeValueFormState) => void;
}

export interface TypeValueFormState {
    variant: ValueAnnotationVariant;
    defaultValueType: DefaultValueType;
    defaultValue: DefaultValue;
    comment: string;
}

const TypeValueForm: React.FC<TypeValueFormProps> = function ({
    target,
    annotationType,
    description,
    previousAnnotation,
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
            comment: '',
        },
    });

    const watchVariant = watch('variant');
    const watchDefaultValueType = watch('defaultValueType');

    useEffect(() => {
        const defaultValueType = previousAnnotation?.defaultValueType ?? 'string';

        let defaultValue: string;
        if (previousAnnotation?.defaultValue === undefined) {
            defaultValue = '';
        } else {
            if (defaultValueType === 'boolean') {
                defaultValue = previousAnnotation?.defaultValue ? 'true' : 'false';
            } else {
                defaultValue = String(previousAnnotation?.defaultValue);
            }
        }

        reset({
            variant: previousAnnotation?.variant ?? 'optional',
            defaultValueType,
            defaultValue,
            comment: previousAnnotation?.comment ?? '',
        });
    }, [
        reset,
        previousAnnotation?.variant,
        previousAnnotation?.defaultValueType,
        previousAnnotation?.defaultValue,
        previousAnnotation?.comment,
    ]);

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
            heading={`${previousAnnotation?.defaultValueType ? 'Edit' : 'Add'} @${annotationType} Annotation`}
            description={description}
            onSave={handleSubmit(handleSave)}
            onCancel={handleCancel}
        >
            <FormLabel>Choose the variant of this annotation:</FormLabel>
            <RadioGroup defaultValue={previousAnnotation?.variant ?? 'optional'} onChange={handleVariantChange}>
                <Stack direction="column">
                    <Radio value="required">
                        <Tooltip
                            label="Users of the wrapper must set this parameter explicitly. This value is passed to the
                            original API."
                        >
                            Required
                        </Tooltip>
                    </Radio>
                    <Radio value="optional">
                        <Tooltip
                            label="Users of the wrapper can set this parameter explicitly. If they do, this value is
                            passed to the original API. Otherwise, a default value is used."
                        >
                            Optional
                        </Tooltip>
                    </Radio>
                    <Radio value="constant">
                        <Tooltip
                            label="This parameter no longer appears in the wrapper. Instead, a constant value is passed
                            to the original API."
                        >
                            Constant
                        </Tooltip>
                    </Radio>
                    <Radio value="omitted">
                        <Tooltip
                            label="This parameter no longer appears in the wrapper. Moreover, no value is passed to the
                            original API, so the original default value is used. This option is only available for
                            parameters that are optional in the original API."
                        >
                            Omitted
                        </Tooltip>
                    </Radio>
                </Stack>
            </RadioGroup>

            {watchVariant !== 'required' && watchVariant !== 'omitted' && (
                <>
                    {watchVariant === 'optional' && (
                        <FormLabel>Type of the default value for &quot;{target.name}&quot;:</FormLabel>
                    )}
                    {watchVariant === 'constant' && (
                        <FormLabel>Type of the constant value for &quot;{target.name}&quot;:</FormLabel>
                    )}
                    <RadioGroup
                        defaultValue={previousAnnotation?.defaultValueType ?? 'string'}
                        onChange={handleTypeChange}
                    >
                        <Stack direction="column">
                            <Radio value="string">String</Radio>
                            <Radio value="number">Number</Radio>
                            <Radio value="boolean">Boolean</Radio>
                            <Radio value="none">None</Radio>
                        </Stack>
                    </RadioGroup>
                </>
            )}

            {watchVariant !== 'required' && watchVariant !== 'omitted' && watchDefaultValueType !== 'none' && (
                <FormControl isInvalid={Boolean(errors?.defaultValue)}>
                    {watchVariant === 'optional' && <FormLabel>Default value for &quot;{target.name}&quot;:</FormLabel>}
                    {watchVariant === 'constant' && (
                        <FormLabel>Constant value for &quot;{target.name}&quot;:</FormLabel>
                    )}

                    {watchDefaultValueType === 'string' && <Input {...register('defaultValue')} />}
                    {watchDefaultValueType === 'number' && (
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
                    {watchDefaultValueType === 'boolean' && (
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

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')} />
            </FormControl>
        </AnnotationForm>
    );
};
