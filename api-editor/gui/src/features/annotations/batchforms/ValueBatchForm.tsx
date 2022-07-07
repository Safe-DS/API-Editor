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
    Textarea,
    Tooltip,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { booleanPattern, numberPattern } from '../../../common/validation';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { ConfirmAnnotations } from './ConfirmAnnotations';
import { upsertValueAnnotations } from '../annotationSlice';

interface ValueBatchFormProps {
    targets: PythonDeclaration[];
}

export const ValueBatchForm: React.FC<ValueBatchFormProps> = function ({ targets }) {
    //only parameters can have optional annotations
    const filteredTargets = targets.filter((t) => t instanceof PythonParameter) as PythonParameter[];
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
                comment: data.comment,
            });
        });
        dispatch(upsertValueAnnotations(all));
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
    targets: PythonParameter[];
    description: string;
    onUpsertAnnotation: (data: TypeValueBatchFormState) => void;
}

export interface TypeValueBatchFormState {
    variant: ValueAnnotationVariant;
    defaultValueType: DefaultValueType;
    defaultValue: DefaultValue;
    comment: string;
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
        setValue,
        watch,
        formState: { errors },
    } = useForm<TypeValueBatchFormState>({
        defaultValues: {
            variant: 'optional',
            defaultValueType: 'string',
            defaultValue: '',
            comment: '',
        },
    });

    const watchVariant = watch('variant');
    const watchDefaultValueType = watch('defaultValueType');

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    let [data, setData] = useState<TypeValueBatchFormState>({
        variant: 'optional',
        defaultValueType: 'string',
        defaultValue: '',
        comment: '',
    });

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
                        <Radio value="required">
                            <Tooltip
                                label="Users of the wrapper must set this parameter explicitly. This value is passed to
                                the original API."
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
                            <FormLabel>Type of the default value for matched elements:</FormLabel>
                        )}
                        {watchVariant === 'constant' && (
                            <FormLabel>Type of the constant value for matched elements:</FormLabel>
                        )}
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

                {watchVariant !== 'required' && watchVariant !== 'omitted' && watchDefaultValueType !== 'none' && (
                    <FormControl isInvalid={Boolean(errors?.defaultValue)}>
                        {watchVariant === 'optional' && <FormLabel>Default value for matched elements:</FormLabel>}
                        {watchVariant === 'constant' && <FormLabel>Constant value for matched elements:</FormLabel>}
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

                <ChakraText>This will annotate parameters.</ChakraText>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    targets={watchVariant === 'omitted' ? targets.filter((it) => it.defaultValue !== null) : targets}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
