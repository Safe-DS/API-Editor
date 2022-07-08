import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    HStack,
    IconButton,
    Input,
    Text,
    Textarea,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FaAngleDoubleRight, FaAngleRight, FaPlus, FaTrash } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { pythonIdentifierPattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { selectEnumAnnotation, upsertEnumAnnotation } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';

interface EnumFormProps {
    target: PythonDeclaration;
}

interface EnumFormState {
    enumName: string;
    pairs: {
        stringValue: string;
        instanceName: string;
    }[];
    comment: string;
}

export const EnumForm: React.FC<EnumFormProps> = function ({ target }) {
    const targetPath = target.id;

    // Hooks -----------------------------------------------------------------------------------------------------------
    const previousAnnotation = useAppSelector(selectEnumAnnotation(target.id));
    const dispatch = useAppDispatch();

    const {
        control,
        register,
        handleSubmit,
        setFocus,
        reset,
        watch,
        setValue,
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
            comment: '',
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'pairs',
    });

    const watchPairs = watch('pairs');

    useEffect(() => {
        try {
            setFocus('enumName');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        reset({
            enumName: previousAnnotation?.enumName ?? '',
            pairs: previousAnnotation?.pairs ?? [
                {
                    stringValue: '',
                    instanceName: '',
                },
            ],
            comment: previousAnnotation?.comment ?? '',
        });
    }, [reset, previousAnnotation, targetPath]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onRemove = (index: number) => () => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const onAppend = () => {
        append({
            stringValue: '',
            instanceName: '',
        });
    };

    const onSave = (data: EnumFormState) => {
        dispatch(
            upsertEnumAnnotation({
                target: targetPath,
                ...data,
            }),
        );
        dispatch(hideAnnotationForm());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForm());
    };

    const onGenerate = (index: number) => () => {
        generateEnumName(index);
    };

    const onGenerateAll = () => {
        for (let i = 0; i < watchPairs.length; i++) {
            generateEnumName(i);
        }
    };

    const generateEnumName = (index: number) => {
        const instanceName = formatEnumName(watchPairs[index].stringValue.toUpperCase());
        setValue(`pairs.${index}.instanceName`, instanceName);
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @enum Annotation`}
            description="Replace this string parameter with an enum parameter."
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
                <IconButton
                    icon={<FaAngleDoubleRight />}
                    aria-label="Generate all instance names"
                    colorScheme="blue"
                    onClick={onGenerateAll}
                />
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
                            onBlur={() => {
                                if (
                                    watchPairs[index].stringValue.length !== 0 &&
                                    watchPairs[index].instanceName.length === 0
                                ) {
                                    generateEnumName(index);
                                }
                            }}
                        />
                        <FormErrorMessage>
                            <FormErrorIcon /> {errors?.pairs?.[index]?.stringValue?.message}
                        </FormErrorMessage>
                    </FormControl>

                    <IconButton
                        icon={<FaAngleRight />}
                        aria-label="Generate instance name"
                        colorScheme="blue"
                        onClick={onGenerate(index)}
                    />

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

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')} />
            </FormControl>
        </AnnotationForm>
    );
};

const formatEnumName = (stringValue: string) => {
    const segments = stringValue.split(/[_\-.]/u);
    const formattedString = segments
        .map((segment) => segment.replaceAll(/\W/gu, '').toUpperCase())
        .filter((segment) => segment.length > 0)
        .join('_');

    if (formattedString.length === 0 || formattedString.charAt(0).match(/\d/u)) {
        return '_' + formattedString;
    }
    return formattedString;
};
