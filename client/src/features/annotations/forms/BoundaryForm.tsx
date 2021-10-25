import {
    Box,
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
    Text,
    Wrap,
    WrapItem,
} from '@chakra-ui/react'
import React, {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useAppDispatch, useAppSelector} from '../../../app/hooks'
import {numberPattern} from '../../../common/validation'
import PythonDeclaration from '../../packageData/model/PythonDeclaration'
import {ComparisonOperator, hideAnnotationForms, Interval, selectBoundary, upsertBoundary,} from '../annotationSlice'
import AnnotationForm from './AnnotationForm'
import {Optional} from "../../../common/util/types";

interface BoundaryFormProps {
    readonly target: PythonDeclaration;
}

interface BoundaryFormState {
    interval: {
        isDiscrete: boolean;
        lowIntervalLimit: number;
        lowerLimitType: ComparisonOperator;
        upperIntervalLimit: number;
        upperLimitType: ComparisonOperator;
    };
}

const initialFormState = function (previousInterval: Optional<Interval>): BoundaryFormState {
    return {
        interval: {
            isDiscrete: previousInterval?.isDiscrete ?? false,
            lowIntervalLimit: previousInterval?.lowIntervalLimit ?? 0,
            lowerLimitType: previousInterval?.lowerLimitType ?? ComparisonOperator.LESS_THAN_OR_EQUALS,
            upperIntervalLimit: previousInterval?.upperIntervalLimit ?? 1,
            upperLimitType: previousInterval?.upperLimitType ?? ComparisonOperator.LESS_THAN_OR_EQUALS,
        },
    }
}

const BoundaryForm: React.FC<BoundaryFormProps> = function ({target}) {
    const targetPath = target.pathAsString()
    const prevInterval = useAppSelector(selectBoundary(targetPath))?.interval

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch()
    const {
        register,
        handleSubmit,
        reset,
        getValues,
        watch,
        setValue,
        formState: {errors},
    } = useForm<BoundaryFormState>({
        defaultValues: initialFormState(prevInterval),
    })

    useEffect(() => {
        reset(initialFormState(prevInterval))
    }, [reset, prevInterval])

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleIsDiscreteChange = (value: string) => {
        if (value === 'true') {
            setValue('interval.isDiscrete', true)
        } else {
            setValue('interval.isDiscrete', false)
        }
    }

    const onSave = (data: BoundaryFormState) => {
        dispatch(
            upsertBoundary({
                target: targetPath,
                interval: {...data.interval},
            }),
        )
        dispatch(hideAnnotationForms())
    }

    const onCancel = () => {
        dispatch(hideAnnotationForms())
    }

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${prevInterval ? 'Edit' : 'Add'} @boundary annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormLabel>
                Type of boundary of &quot;{target.name}&quot;:
            </FormLabel>
            <RadioGroup
                defaultValue={prevInterval?.isDiscrete.toString() || 'false'}
                onChange={handleIsDiscreteChange}
            >
                <Stack direction='column'>
                    <Radio value='false'>Continuous</Radio>
                    <Radio value='true'>Discrete</Radio>
                </Stack>
            </RadioGroup>
            <br/>
            <Wrap spacing='10px'>
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
                                        disabled: watch('interval.lowerLimitType') === ComparisonOperator.UNRESTRICTED,
                                        // Example for cross-field validation
                                        validate: {
                                            nonEmptyInterval() {
                                                const lowerLimit = getValues('interval.lowIntervalLimit')
                                                const lowerLimitType = getValues('interval.lowerLimitType')
                                                const upperLimit = getValues('interval.upperIntervalLimit')
                                                const upperLimitType = getValues('interval.upperLimitType')

                                                if (lowerLimitType === ComparisonOperator.UNRESTRICTED || upperLimitType === ComparisonOperator.UNRESTRICTED) {
                                                    return true
                                                }

                                                if (lowerLimitType === ComparisonOperator.LESS_THAN || upperLimitType === ComparisonOperator.LESS_THAN) {
                                                    return lowerLimit < upperLimit
                                                }

                                                return lowerLimit <= upperLimit
                                            }
                                        }
                                    })}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper/>
                                    <NumberDecrementStepper/>
                                </NumberInputStepper>
                            </NumberInput>
                            <FormErrorMessage>
                                <FormErrorIcon/> {errors?.interval?.lowIntervalLimit?.message}
                            </FormErrorMessage>
                        </FormControl>
                        <Select
                            {...register('interval.lowerLimitType', {
                                required: 'This is required.',
                                valueAsNumber: true
                            })}
                        >
                            <option value={ComparisonOperator.LESS_THAN_OR_EQUALS}>{'<='}</option>
                            <option value={ComparisonOperator.LESS_THAN}>{'<'}</option>
                            <option value={ComparisonOperator.UNRESTRICTED}>no lower limit</option>
                        </Select>
                    </HStack>
                </WrapItem>
                <Box display='flex' alignItems='center' fontWeight='bold'>
                    {target.name}
                </Box>
                <WrapItem>
                    <HStack spacing='10px'>
                        <Select
                            {...register('interval.upperLimitType', {
                                required: 'This is required.',
                                valueAsNumber: true,
                            })}
                        >
                            <option value={ComparisonOperator.LESS_THAN_OR_EQUALS}>{'<='}</option>
                            <option value={ComparisonOperator.LESS_THAN}>{'<'}</option>
                            <option value={ComparisonOperator.UNRESTRICTED}>no upper limit</option>
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
                                        disabled: watch('interval.upperLimitType') === ComparisonOperator.UNRESTRICTED
                                    })}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper/>
                                    <NumberDecrementStepper/>
                                </NumberInputStepper>
                            </NumberInput>
                            <FormErrorMessage>
                                <FormErrorIcon/> {errors?.interval?.upperIntervalLimit?.message}
                            </FormErrorMessage>
                        </FormControl>
                    </HStack>
                </WrapItem>

            </Wrap>

            {errors?.interval?.lowIntervalLimit?.type === "nonEmptyInterval" &&
                <Text color='red'>Interval must not be empty.</Text>
            }
        </AnnotationForm>
    )
}

export default BoundaryForm
