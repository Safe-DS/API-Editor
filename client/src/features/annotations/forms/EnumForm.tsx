import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    HStack,
    IconButton,
    Input,
    Text,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { pythonIdentifierPattern } from '../../../common/validation'
import PythonDeclaration from '../../../model/python/PythonDeclaration'
import { hideAnnotationForms, selectEnum, upsertEnum } from '../annotationSlice'
import AnnotationForm from './AnnotationForm'

interface EnumFormProps {
    target: PythonDeclaration
}

interface EnumFormState {
    enumName: string
    pairs: {
        stringValue: string
        instanceName: string
    }[]
}

const EnumForm: React.FC<EnumFormProps> = ({ target }) => {
    const targetPath = target.pathAsString()

    // Hooks -----------------------------------------------------------------------------------------------------------
    const enumDefinition = useAppSelector(selectEnum(target.pathAsString()))
    const dispatch = useAppDispatch()

    const {
        control,
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<EnumFormState>({
        defaultValues: {
            enumName: '',
            pairs: [
                {
                    stringValue: '',
                    instanceName: '',
                },
            ],
        },
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'pairs',
    })

    useEffect(() => {
        setFocus('enumName')
    }, [setFocus])

    useEffect(() => {
        reset({
            enumName: enumDefinition?.enumName ?? '',
            pairs: enumDefinition?.pairs ?? [
                {
                    stringValue: '',
                    instanceName: '',
                },
            ],
        })
    }, [reset, enumDefinition, targetPath])

    // Event handlers --------------------------------------------------------------------------------------------------

    const onRemove = (index: number) => () => {
        if (fields.length > 1) {
            remove(index)
        }
    }

    const onAppend = () => {
        append({
            stringValue: '',
            instanceName: '',
        })
    }

    const onSave = (data: EnumFormState) => {
        dispatch(
            upsertEnum({
                target: targetPath,
                ...data,
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
            heading={`${enumDefinition ? 'Edit' : 'Add'} @enum annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            {/* Enum name -------------------------------------------------------------------------------------------*/}
            <FormControl isInvalid={Boolean(errors.enumName)}>
                <FormLabel>Enum name for &quot;{target.name}&quot;:</FormLabel>
                <Input
                    {...register('enumName', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.enumName?.message}
                </FormErrorMessage>
            </FormControl>

            {/* Enum pairs ------------------------------------------------------------------------------------------*/}
            <HStack>
                <Text fontSize="md" fontWeight="medium" w="100%">
                    String value:
                </Text>
                <Text fontSize="md" fontWeight="medium" w="100%">
                    Instance name:
                </Text>
                <IconButton icon={<FaPlus />} aria-label="Add enum pair" colorScheme="green" onClick={onAppend} />
            </HStack>

            {fields.map((field, index) => (
                <HStack key={field.id} alignItems="flex-start">
                    <FormControl isInvalid={Boolean(errors?.pairs?.[index]?.stringValue)}>
                        <Input
                            {...register(`pairs.${index}.stringValue`, {
                                required: 'This is required.',
                            })}
                        />
                        <FormErrorMessage>
                            <FormErrorIcon /> {errors?.pairs?.[index]?.stringValue?.message}
                        </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={Boolean(errors?.pairs?.[index]?.instanceName)}>
                        <Input
                            {...register(`pairs.${index}.instanceName`, {
                                required: 'This is required.',
                                pattern: pythonIdentifierPattern,
                            })}
                        />
                        <FormErrorMessage>
                            <FormErrorIcon /> {errors?.pairs?.[index]?.instanceName?.message}
                        </FormErrorMessage>
                    </FormControl>

                    <IconButton
                        icon={<FaTrash />}
                        aria-label="Delete enum pair"
                        colorScheme="red"
                        disabled={fields.length <= 1}
                        onClick={onRemove(index)}
                    />
                </HStack>
            ))}
        </AnnotationForm>
    )
}

export default EnumForm
