import {
    Checkbox,
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Input,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { pythonIdentifierPattern } from '../../../common/validation';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { AnnotationForm } from './AnnotationForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { selectGroupAnnotations, upsertGroupAnnotation } from '../annotationSlice';
import { GroupAnnotation } from '../versioning/AnnotationStoreV2';

interface GroupFormProps {
    readonly target: PythonDeclaration;
    readonly groupName?: string;
}

interface GroupFormState {
    groupName: string;
    parameters: { [name: string]: boolean };
    dummy: string;
    comment: string;
}

export const GroupForm: React.FC<GroupFormProps> = function ({ target, groupName }) {
    const targetPath = target.id;
    const currentGroups = useAppSelector(selectGroupAnnotations(targetPath));
    let previousAnnotation: GroupAnnotation | undefined;
    if (groupName && currentGroups) {
        previousAnnotation = currentGroups[groupName];
    }
    let otherGroupNames: string[] = [];
    if (currentGroups) {
        otherGroupNames = Object.values(currentGroups)
            .filter((group) => group.groupName !== previousAnnotation?.groupName)
            .map((group) => group.groupName);
    }

    let allParameters: PythonParameter[] = [];

    if (target instanceof PythonFunction) {
        allParameters = target.explicitParameters();
    }

    const groupContainsParameter = (key: string, name: string) => {
        if (!currentGroups) {
            return null;
        }
        return currentGroups[key]?.parameters?.some((parameter) => parameter === name);
    };

    const getParameterLabel = (parameterName: string) => {
        for (const groupKey of otherGroupNames) {
            if (currentGroups && groupContainsParameter(groupKey, parameterName) && !isCurrentGroup(groupKey)) {
                return `${parameterName} (already used in ${currentGroups[groupKey].groupName})`;
            }
        }
        return parameterName;
    };

    const isCurrentGroup = (key: string) =>
        previousAnnotation && (!currentGroups || currentGroups[key]?.groupName === previousAnnotation.groupName);

    const getSelectedParameters = (): string[] =>
        Object.entries(getValues('parameters'))
            .filter(([, isSelected]) => isSelected)
            .map(([name]) => name);

    const checkedAtLeastOne = () => getSelectedParameters().length >= 1;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        getValues,
        handleSubmit,
        setFocus,
        register,
        reset,
        formState: { errors },
    } = useForm<GroupFormState>({
        defaultValues: {
            groupName: '',
            parameters: {},
            comment: '',
        },
    });

    useEffect(() => {
        try {
            setFocus('groupName');
        } catch (e) {
            // ignore
        }
    }, [setFocus]);

    useEffect(() => {
        const prevParameters: { [name: string]: boolean } = {};
        previousAnnotation?.parameters?.forEach((name) => {
            prevParameters[name] = true;
        });

        reset({
            groupName: previousAnnotation?.groupName || '',
            parameters: prevParameters,
            comment: previousAnnotation?.comment || '',
        });
    }, [reset, previousAnnotation]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: GroupFormState) => {
        dispatch(
            upsertGroupAnnotation({
                target: targetPath,
                groupName: data.groupName,
                parameters: getSelectedParameters(),
                comment: data.comment,
            }),
        );
        dispatch(hideAnnotationForm());
    };

    const onCancel = () => {
        dispatch(hideAnnotationForm());
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${previousAnnotation ? 'Edit' : 'Add'} @group Annotation`}
            description="Replace multiple parameters of this function with a parameter object."
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors?.groupName)}>
                <FormLabel>Function &quot;{target.name}&quot;:</FormLabel>
                <Input
                    placeholder="Name of parameter object"
                    {...register('groupName', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.groupName?.message}
                </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors?.parameters)}>
                <VStack alignItems="left">
                    {allParameters.map((parameter) => (
                        <Checkbox key={parameter.name} {...register(`parameters.${parameter.name}`)}>
                            {getParameterLabel(parameter.name)}
                        </Checkbox>
                    ))}
                </VStack>
            </FormControl>

            <FormControl isInvalid={'dummy' in errors}>
                <Input
                    type="hidden"
                    {...register('dummy', {
                        validate: () => checkedAtLeastOne(),
                    })}
                    onChange={() => {}}
                />
                <FormErrorMessage>
                    <FormErrorIcon />
                    {errors.dummy && 'At least one parameter needs to be selected.'}
                </FormErrorMessage>
            </FormControl>

            <FormControl>
                <FormLabel>Comment:</FormLabel>
                <Textarea {...register('comment')}/>
            </FormControl>
        </AnnotationForm>
    );
};
