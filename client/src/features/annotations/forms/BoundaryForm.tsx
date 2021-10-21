import {
    Box,
    FormControl,
    FormErrorMessage,
    FormErrorIcon,
    FormLabel,
    HStack,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Wrap,
    WrapItem,
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

const BoundaryForm: React.FC<BoundaryFormProps> = function({ target }) {
    const targetPath = target.pathAsString();
    const prevInterval = useAppSelector(selectBoundary(targetPath))?.interval;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
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
    })

    useEffect(() => {
        reset({
            interval: {
                isDiscrete: prevInterval?.isDiscrete || false,
                lowIntervalLimit: prevInterval?.lowIntervalLimit || 0,
                upperIntervalLimit: prevInterval?.upperIntervalLimit || 0,
                isLowLimitExclusive: prevInterval?.isLowLimitExclusive || false,
                isUpperLimitExclusive: prevInterval?.isUpperLimitExclusive || false,
            },
        });
    }, [reset, prevInterval]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleIsDiscreteChange = (value: string) => {
        if (value === 'true') {
            setValue('interval.isDiscrete', true)
        } else {
            setValue('interval.isDiscrete', false)
        }
    }

    const handleIsLowLimitExclusiveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        if (value === 'true') {
            setValue('interval.isLowLimitExclusive', true)
        } else {
            setValue('interval.isLowLimitExclusive', false)
        }
    }

    const handleIsUpperLimitExclusiveChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        if (value === 'true') {
            setValue('interval.isUpperLimitExclusive', true)
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
            <FormLabel>
                Type of default value of &quot;{target.name}&quot;:
            </FormLabel>
            <RadioGroup
                defaultValue={prevInterval?.isDiscrete.toString() || 'true'}
                onChange={handleIsDiscreteChange}
            >
                <Stack direction='column'>
                    <Radio value='true'>Discrete</Radio>
                    <Radio value='false'>Continuous</Radio>
                </Stack>
            </RadioGroup>
            <br />
            <Wrap spacing='10px' justfiy='center'>
                <WrapItem>
                    <HStack spacing='10px'>
                        <FormControl
                            invalid={Boolean(errors?.interval?.lowIntervalLimit)}>
                            <NumberInput
                                minW={48}
                                maxW={48}
                            >
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
                            <FormErrorMessage>
                                <FormErrorIcon /> {errors?.interval?.lowIntervalLimit?.message}
                            </FormErrorMessage>
                        </FormControl>
                        <Select
                            defaultValue={prevInterval?.isLowLimitExclusive.toString() || 'false'}
                            onChange={handleIsLowLimitExclusiveChange}
                            minW={24}
                            maxW={24}
                        >
                            <option value='false'>{'<='}</option>
                            <option value='true'>{'<'}</option>
                        </Select>
                    </HStack>
                </WrapItem>
                <Box display='flex' alignItems='center'>
                    {target.name}
                </Box>
                <WrapItem>
                    <HStack spacing='10px'>
                        <Select
                            defaultValue={prevInterval?.isUpperLimitExclusive.toString() || 'false'}
                            onChange={handleIsUpperLimitExclusiveChange}
                            minW={24}
                            maxW={24}
                        >
                            <option value='false'>{'<='}</option>
                            <option value='true'>{'<'}</option>
                        </Select>
                        <FormControl
                            invalid={Boolean(errors?.interval?.upperIntervalLimit)}>
                            <NumberInput
                                minW={48}
                                maxW={48}
                            >
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
                            <FormErrorMessage>
                                <FormErrorIcon /> {errors?.interval?.upperIntervalLimit?.message}
                            </FormErrorMessage>
                        </FormControl>
                    </HStack>
                </WrapItem>
            </Wrap>
        </AnnotationForm>
    );
};

export default BoundaryForm;
