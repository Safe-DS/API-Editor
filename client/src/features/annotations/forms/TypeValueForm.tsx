import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {
    DefaultType,
    DefaultValue,
    hideAnnotationForms,
} from '../annotationSlice';
import { Optional } from '../../../common/util/types';
import { useAppDispatch } from '../../../app/hooks';
import { useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import AnnotationForm from './AnnotationForm';
import { booleanPattern, numberPattern } from '../../../common/validation';
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

interface TypeValueFormProps {
    target: PythonDeclaration;
    annotationType: string;
    previousDefaultType: Optional<DefaultType>;
    previousDefaultValue: Optional<DefaultValue>;
    onUpsertAnnotation: (data: TypeValueFormState) => void;
}

export interface TypeValueFormState {
    defaultType: DefaultType;
    defaultValue: DefaultValue;
}

const TypeValueForm: React.FC<TypeValueFormProps> = function ({
    target,
    annotationType,
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
            defaultType: 'string',
            defaultValue: '',
        },
    });

    const watchDefaultType = watch('defaultType');

    useEffect(() => {
        reset({
            defaultType: previousDefaultType || 'string',
            defaultValue: previousDefaultValue || '',
        });
    }, [reset, previousDefaultType, previousDefaultValue]);

    // Event handlers ----------------------------------------------------------

    const handleTypeChange = (newType: DefaultType) => {
        setValue('defaultType', newType);
        reset({
            defaultType: newType,
            defaultValue: '',
        });
    };

    const handleSave = (data: TypeValueFormState) => {
        onUpsertAnnotation(data);
        dispatch(hideAnnotationForms());
    };

    const handleCancel = () => {
        dispatch(hideAnnotationForms());
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${
                previousDefaultType ? 'Edit' : 'Add'
            } @${annotationType} annotation`}
            onSave={handleSubmit(handleSave)}
            onCancel={handleCancel}
        >
            <FormLabel>
                Type of default value of &quot;{target.name}&quot;:
            </FormLabel>
            <RadioGroup
                defaultValue={previousDefaultType || 'string'}
                onChange={handleTypeChange}
            >
                <Stack direction="column">
                    <Radio value="string">String</Radio>
                    <Radio value="number">Number</Radio>
                    <Radio value="boolean">Boolean</Radio>
                </Stack>
            </RadioGroup>

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

export default TypeValueForm;
