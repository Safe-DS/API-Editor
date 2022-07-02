import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import {
    DefaultValue,
    DefaultValueType,
    ValueAnnotation,
    ValueAnnotationVariant,
} from '../versioning/AnnotationStoreV2';
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
    Text as ChakraText,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { booleanPattern, numberPattern } from '../../../common/validation';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { ConfirmAnnotations } from './ConfirmAnnotations';
import { upsertValues } from '../annotationSlice';

interface ValueBatchFormProps {
    targets: PythonDeclaration[];
}

export const ValueBatchForm: React.FC<ValueBatchFormProps> = function ({ targets }) {
    //only parameters can have optional annotations
    const filteredTargets = targets.filter((t) => t instanceof PythonParameter);
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueBatchFormState) => {
        const all: ValueAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
                variant: data.variant,
                defaultValueType: data.defaultValueType,
                defaultValue: data.defaultValue,
            });
        });
        dispatch(upsertValues(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueBatchForm
            targets={filteredTargets}
            description="Change how the value of matched parameters is set."
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};

interface TypeValueBatchFormProps {
    targets: PythonDeclaration[];
    description: string;
    onUpsertAnnotation: (data: TypeValueBatchFormState) => void;
}

export interface TypeValueBatchFormState {
    variant: ValueAnnotationVariant;
    defaultValueType: DefaultValueType;
    defaultValue: DefaultValue;
}

export const TypeValueBatchForm: React.FC<TypeValueBatchFormProps> = function ({
    targets,
    description,
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
    } = useForm<TypeValueBatchFormState>({
        defaultValues: {
            variant: 'optional',
            defaultValueType: 'string',
            defaultValue: '',
        },
    });

    const watchVariant = watch('variant');
    const watchDefaultValueType = watch('defaultValueType');

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    let [data, setData] = useState<TypeValueBatchFormState>({
        variant: 'optional',
        defaultValueType: 'string',
        defaultValue: '',
    });

    // Event handlers ----------------------------------------------------------

    const handleVariantChange = (newVariant: ValueAnnotationVariant) => {
        setValue('variant', newVariant);
    };

    const handleTypeChange = (newType: DefaultValueType) => {
        setValue('defaultValueType', newType);
        reset({
            variant: 'optional',
            defaultValueType: newType,
            defaultValue: '',
        });
    };

    const handleSave = (annotationData: TypeValueBatchFormState) => {
        let toUpsert = { ...annotationData };
        if (annotationData.defaultValueType === 'boolean') {
            toUpsert = { ...annotationData, defaultValue: annotationData.defaultValue === 'true' };
        } else if (annotationData.defaultValueType === 'none') {
            toUpsert = { ...annotationData, defaultValue: null };
        }
        onUpsertAnnotation(toUpsert);

        setConfirmWindowVisible(false);
        dispatch(hideAnnotationForm());
    };

    const handleConfirm = (newData: TypeValueBatchFormState) => {
        setData(newData);
        setConfirmWindowVisible(true);
    };

    const handleCancel = () => {
        dispatch(hideAnnotationForm());
    };
    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <>
            <AnnotationBatchForm
                heading={`Add @value Annotations`}
                description={description}
                onConfirm={handleSubmit(handleConfirm)}
                onCancel={handleCancel}
            >
                <FormLabel>Choose the variant of this annotation:</FormLabel>
                <RadioGroup defaultValue={'optional'} onChange={handleVariantChange}>
                    <Stack direction="column">
                        <Radio value="required">Required (parameter must always be set)</Radio>
                        <Radio value="optional">Optional (parameter has default value that can be overwritten)</Radio>
                        <Radio value="constant">
                            Constant (parameter has a constant value and cannot be overwritten)
                        </Radio>
                    </Stack>
                </RadioGroup>

                {watchVariant !== 'required' && (
                    <>
                        <FormLabel>Type of default value of selected elements:</FormLabel>
                        <RadioGroup defaultValue={'string'} onChange={handleTypeChange}>
                            <Stack direction="column">
                                <Radio value="string">String</Radio>
                                <Radio value="number">Number</Radio>
                                <Radio value="boolean">Boolean</Radio>
                                <Radio value="none">None</Radio>
                            </Stack>
                        </RadioGroup>
                    </>
                )}

                {watchVariant !== 'required' && watchDefaultValueType !== 'none' && (
                    <FormControl isInvalid={Boolean(errors?.defaultValue)}>
                        <FormLabel>Default value for selected elements:</FormLabel>
                        {watchDefaultValueType === 'string' && (
                            <Input
                                {...register('defaultValue', {
                                    required: 'This is required.',
                                })}
                            />
                        )}
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

                <ChakraText>This will annotate parameters.</ChakraText>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    targets={targets}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
