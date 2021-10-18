import {
    FormControl,
    FormLabel,
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
import { numberPattern } from '../../../common/validation';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {
    hideAnnotationForms,
    selectBoundary,
    upsertBoundary,
} from '../annotationSlice';
import AnnotationForm from './AnnotationForm';

interface BoundaryFormProps {
    readonly target: PythonDeclaration;
}

interface BoundaryFormState {
    interval: {
        isDiscrete: boolean;
        lowIntervalLimit: number;
        upperIntervalLimit: number;
        isLowLimitExclusive: boolean;
        isUpperLimitExclusive: boolean;
    };
}

const BoundaryForm: React.FC<BoundaryFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();
    const prevInterval = useAppSelector(selectBoundary(targetPath))?.interval;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        /* watch, */
        /* formState: { errors }, */
    } = useForm<BoundaryFormState>({
        defaultValues: {
            interval: {
                isDiscrete: false,
                lowIntervalLimit: 0,
                upperIntervalLimit: 0,
                isLowLimitExclusive: false,
                isUpperLimitExclusive: false,
            },
        },
    });

    // const watchIsDiscrete = watch('interval.isDiscrete');

    const isLowLimitExclusiveRegister = register(
        'interval.isLowLimitExclusive',
        {
            required: 'This is required.',
        },
    );
    const isUpperLimitExclusiveRegister = register(
        'interval.isUpperLimitExclusive',
        {
            required: 'This is required.',
        },
    );
    // const watchIsLowLimitExclusive = watch('interval.isLowLimitExclusive');
    // const watchIsUpperLimitExclusive = watch('interval.isUpperLimitExclusive');

    useEffect(() => {
        reset({
            interval: {
                isDiscrete: prevInterval?.isDiscrete || false,
                lowIntervalLimit: prevInterval?.lowIntervalLimit || 0,
                upperIntervalLimit: prevInterval?.upperIntervalLimit || 0,
                isLowLimitExclusive: prevInterval?.isLowLimitExclusive || false,
                isUpperLimitExclusive:
                    prevInterval?.isUpperLimitExclusive || false,
            },
        });
    }, [reset, prevInterval]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleIsDiscreteChange = (value: string) => {
        if (value === 'true') {
            setValue('interval.isDiscrete', true);
        } else {
            setValue('interval.isDiscrete', false);
        }
    };

    const onSave = (data: BoundaryFormState) => {
        dispatch(
            upsertBoundary({
                target: targetPath,
                ...data,
            }),
        );
        dispatch(hideAnnotationForms());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForms());
    };

    const registerOnIsLowLimitExclusiveChange =
        isLowLimitExclusiveRegister.onChange;
    isLowLimitExclusiveRegister.onChange = (event) => {
        const result = registerOnIsLowLimitExclusiveChange(event);
        if (event.target.value === 'true') {
            setValue('interval.isLowLimitExclusive', true);
        } else {
            setValue('interval.isLowLimitExclusive', false);
        }
        return result;
    };

    const registerOnIsUpperLimitExclusiveChange =
        isUpperLimitExclusiveRegister.onChange;
    isUpperLimitExclusiveRegister.onChange = (event) => {
        const result = registerOnIsUpperLimitExclusiveChange(event);
        if (event.target.value === 'true') {
            setValue('interval.isUpperLimitExclusive', true);
        } else {
            setValue('interval.isUpperLimitExclusive', false);
        }
        return result;
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${prevInterval ? 'Edit' : 'Add'} @boundary annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl>
                <FormLabel>
                    Type of default value of &quot;{target.name}&quot;:
                </FormLabel>
                <RadioGroup
                    defaultValue={prevInterval?.isDiscrete.toString() || 'true'}
                    onChange={handleIsDiscreteChange}
                >
                    <Stack direction="column">
                        <Radio value="true">Discrete</Radio>
                        <Radio value="false">Continuous</Radio>
                    </Stack>
                </RadioGroup>
            </FormControl>
            <FormControl>
                <Select {...isLowLimitExclusiveRegister}>
                    <option value="false">{'<='}</option>
                    <option value="true">{'<'}</option>
                </Select>
                <Select {...isUpperLimitExclusiveRegister}>
                    <option value="false">{'<='}</option>
                    <option value="true">{'<'}</option>
                </Select>
            </FormControl>
            <FormControl>
                <NumberInput>
                    <NumberInputField
                        {...register('interval.lowIntervalLimit', {
                            required: 'This is required.',
                            pattern: numberPattern,
                        })}
                    />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <NumberInput>
                    <NumberInputField
                        {...register('interval.upperIntervalLimit', {
                            required: 'This is required.',
                            pattern: numberPattern,
                        })}
                    />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>
        </AnnotationForm>
    );
};

export default BoundaryForm;
