import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
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
    Text as ChakraText,
    Textarea,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { numberPattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { AnnotationForm } from './AnnotationForm';
import { Optional } from '../../../common/util/types';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { BoundaryAnnotation, ComparisonOperator } from '../versioning/AnnotationStoreV2';
import { selectBoundaryAnnotation, upsertBoundaryAnnotation } from '../annotationSlice';

interface BoundaryFormProps {
    readonly target: PythonDeclaration;
}

interface BoundaryFormState {
    interval: {
        isDiscrete: boolean;
        lowerIntervalLimit: Optional<number>;
        lowerLimitType: ComparisonOperator;
        upperIntervalLimit: Optional<number>;
        upperLimitType: ComparisonOperator;
    };
    comment: string;
}

const initialFormState = function (previousAnnotation: BoundaryAnnotation | void): BoundaryFormState {
    return {
        interval: {
            isDiscrete: previousAnnotation?.interval?.isDiscrete ?? false,
            lowerIntervalLimit: previousAnnotation?.interval?.lowerIntervalLimit ?? 0,
            lowerLimitType: previousAnnotation?.interval?.lowerLimitType ?? ComparisonOperator.LESS_THAN_OR_EQUALS,
            upperIntervalLimit: previousAnnotation?.interval?.upperIntervalLimit ?? 1,
            upperLimitType: previousAnnotation?.interval?.upperLimitType ?? ComparisonOperator.LESS_THAN_OR_EQUALS,
        },
        comment: previousAnnotation?.comment ?? '',
    };
};

export const BoundaryForm: React.FC<BoundaryFormProps> = function ({ target }) {
    const targetPath = target.id;
    const previousAnnotation = useAppSelector(selectBoundaryAnnotation(targetPath));

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        register,
        handleSubmit,
        reset,
        getValues,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BoundaryFormState>({
        defaultValues: initialFormState(previousAnnotation),
        shouldFocusError: false,
    });

    useEffect(() => {
        reset(initialFormState(previousAnnotation));
    }, [reset, previousAnnotation]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleIsDiscreteChange = (value: string) => {
        setValue('interval.isDiscrete', value === 'true');
    };

    const onSave = (data: BoundaryFormState) => {
        dispatch(
            upsertBoundaryAnnotation({
                target: targetPath,
                interval: {
                    isDiscrete: data.interval.isDiscrete,
                    lowerIntervalLimit: data.interval.lowerIntervalLimit ?? 0,
                    lowerLimitType: data.interval.lowerLimitType,
                    upperIntervalLimit: data.interval.upperIntervalLimit ?? 0,
                    upperLimitType: data.interval.upperLimitType,
                },
                comment: data.comment,
            }),
        );
        dispatch(hideAnnotationForm());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForm());
    };

    // Validation ------------------------------------------------------------------------------------------------------

    const unrestrictedInterval = () => {
        const lowerLimitType = getValues('interval.lowerLimitType');
        const upperLimitType = getValues('interval.upperLimitType');

        return !(
            lowerLimitType === ComparisonOperator.UNRESTRICTED && upperLimitType === ComparisonOperator.UNRESTRICTED
        );
    };

    const nonEmptyInterval = () => {
        const lowerLimit = getValues('interval.lowerIntervalLimit');
        const lowerLimitType = getValues('interval.lowerLimitType');
        const upperLimit = getValues('interval.upperIntervalLimit');
        const upperLimitType = getValues('interval.upperLimitType');

        // Already handled by making the fields required
        if (typeof lowerLimit !== 'number' || typeof upperLimit !== 'number') {
            return true;
        }
        if (Number.isNaN(lowerLimit) || Number.isNaN(upperLimit)) {
            return true;
        }

        if (lowerLimitType === ComparisonOperator.UNRESTRICTED || upperLimitType === ComparisonOperator.UNRESTRICTED) {
            return true;
        }

        if (lowerLimitType === ComparisonOperator.LESS_THAN || upperLimitType === ComparisonOperator.LESS_THAN) {
            return lowerLimit < upperLimit;
        }

        return lowerLimit <= upperLimit;
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @boundary Annotation`}
            description="Specify the interval of valid values of this numeric parameter."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl>
                <FormLabel>Type of boundary of &quot;{target.name}&quot;:</FormLabel>
                <RadioGroup
                    defaultValue={previousAnnotation?.interval?.isDiscrete.toString() || 'false'}
                    onChange={handleIsDiscreteChange}
                >
                    <Stack direction="column">
                        <Radio value="false">Continuous</Radio>
                        <Radio value="true">Discrete</Radio>
                    </Stack>
                </RadioGroup>
            </FormControl>

            <HStack spacing="10px" alignItems="flexStart">
                <FormControl isInvalid={Boolean(errors?.interval?.lowerIntervalLimit)}>
                    <NumberInput
                        {...register('interval.lowerIntervalLimit', {
                            required: 'This is required.',
                            pattern: numberPattern,
                            valueAsNumber: true,
                            disabled: watch('interval.lowerLimitType') === ComparisonOperator.UNRESTRICTED,
                            validate: {
                                nonEmptyInterval,
                            },
                        })}
                        min={undefined}
                        max={undefined}
                        onChange={(_, valueAsNumber) => setValue('interval.lowerIntervalLimit', valueAsNumber)}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                        <FormErrorIcon />
                        {errors?.interval?.lowerIntervalLimit?.message ||
                            (errors?.interval?.lowerIntervalLimit?.type === 'nonEmptyInterval' && 'Interval is empty.')}
                    </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={Boolean(errors?.interval?.lowerLimitType)}>
                    <Select
                        {...register('interval.lowerLimitType', {
                            required: 'This is required.',
                            valueAsNumber: true,
                            validate: {
                                unrestrictedInterval,
                            },
                        })}
                    >
                        <option value={ComparisonOperator.LESS_THAN_OR_EQUALS}>≤</option>
                        <option value={ComparisonOperator.LESS_THAN}>{'<'}</option>
                        <option value={ComparisonOperator.UNRESTRICTED}>no lower limit</option>
                    </Select>
                    <FormErrorMessage>
                        <FormErrorIcon />
                        {errors?.interval?.lowerLimitType?.message ||
                            (errors?.interval?.lowerLimitType?.type === 'unrestrictedInterval' &&
                                'Interval is unrestricted.')}
                    </FormErrorMessage>
                </FormControl>

                <ChakraText fontWeight="bold" paddingTop={2}>
                    {target.name}
                </ChakraText>

                <FormControl isInvalid={Boolean(errors?.interval?.upperLimitType)}>
                    <Select
                        {...register('interval.upperLimitType', {
                            required: 'This is required.',
                            valueAsNumber: true,
                            validate: {
                                unrestrictedInterval,
                            },
                        })}
                    >
                        <option value={ComparisonOperator.LESS_THAN_OR_EQUALS}>≤</option>
                        <option value={ComparisonOperator.LESS_THAN}>{'<'}</option>
                        <option value={ComparisonOperator.UNRESTRICTED}>no upper limit</option>
                    </Select>
                    <FormErrorMessage>
                        <FormErrorIcon />
                        {errors?.interval?.upperLimitType?.message ||
                            (errors?.interval?.upperLimitType?.type === 'unrestrictedInterval' &&
                                'Interval is unrestricted.')}
                    </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={Boolean(errors?.interval?.upperIntervalLimit)}>
                    <NumberInput
                        {...register('interval.upperIntervalLimit', {
                            required: 'This is required.',
                            pattern: numberPattern,
                            valueAsNumber: true,
                            disabled: watch('interval.upperLimitType') === ComparisonOperator.UNRESTRICTED,
                            validate: {
                                nonEmptyInterval,
                            },
                        })}
                        min={undefined}
                        max={undefined}
                        onChange={(_, valueAsNumber) => setValue('interval.upperIntervalLimit', valueAsNumber)}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                        <FormErrorIcon />
                        {errors?.interval?.upperIntervalLimit?.message ||
                            (errors?.interval?.upperIntervalLimit?.type === 'nonEmptyInterval' && 'Interval is empty.')}
                    </FormErrorMessage>
                </FormControl>
            </HStack>

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')}/>
            </FormControl>
        </AnnotationForm>
    );
};
