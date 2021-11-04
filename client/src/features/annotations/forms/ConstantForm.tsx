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
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { booleanPattern, numberPattern } from '../../../common/validation';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {
    DefaultType,
    DefaultValue,
    hideAnnotationForms,
    selectConstant,
    upsertConstant,
} from '../annotationSlice';
import AnnotationForm from './AnnotationForm';

interface ConstantFormProps {
    target: PythonDeclaration;
}

interface ConstantFormState {
    defaultValue: DefaultValue;
    defaultType: DefaultType;
}

const ConstantForm: React.FC<ConstantFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();

    // Hooks -----------------------------------------------------------------------------------------------------------
    const constantDefinition = useAppSelector(selectConstant(targetPath));
    const prevDefaultType = constantDefinition?.defaultType;
    const prevDefaultValue = constantDefinition?.defaultValue;
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        register,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ConstantFormState>({
        defaultValues: {
            defaultType: 'string',
            defaultValue: '',
        },
    });

    const watchDefaultType = watch('defaultType');

    useEffect(() => {
        reset({
            defaultType: prevDefaultType || 'string',
            defaultValue: prevDefaultValue || '',
        });
    }, [reset, prevDefaultType, prevDefaultValue]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleTypeChange = (newType: DefaultType) => {
        setValue('defaultType', newType);
        reset({
            defaultType: newType,
            defaultValue: '',
        });
    };

    const onSave = (data: ConstantFormState) => {
        dispatch(
            upsertConstant({
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
            heading={`${
                constantDefinition ? 'Edit' : 'Add'
            } @constant annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormLabel>
                Type of default value of &quot;{target.name}&quot;:
            </FormLabel>
            <RadioGroup
                defaultValue={prevDefaultType || 'string'}
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

export default ConstantForm;
