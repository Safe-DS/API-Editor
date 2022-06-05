import { Checkbox, FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input, VStack } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { pythonIdentifierPattern } from '../../../common/validation';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import PythonFunction from '../../packageData/model/PythonFunction';
import PythonParameter from '../../packageData/model/PythonParameter';
import { GroupAnnotation, hideAnnotationForms, selectGroups, upsertGroup } from '../annotationSlice';
import { AnnotationForm } from './AnnotationForm';

interface GroupFormProps {
    readonly target: PythonDeclaration;
    readonly groupName?: string;
}

interface GroupFormState {
    groupName: string;
    parameters: { [name: string]: boolean };
    dummy: string;
}

export const GroupForm: React.FC<GroupFormProps> = function ({ target, groupName }) {
    const targetPath = target.pathAsString();
    const currentGroups = useAppSelector(selectGroups(targetPath));
    let prevGroupAnnotation: GroupAnnotation | undefined;
    if (groupName && currentGroups) {
        prevGroupAnnotation = currentGroups[groupName];
    }
    let otherGroupNames: string[] = [];
    if (currentGroups) {
        otherGroupNames = Object.values(currentGroups)
            .filter((group) => group.groupName !== prevGroupAnnotation?.groupName)
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
        prevGroupAnnotation && (!currentGroups || currentGroups[key]?.groupName === prevGroupAnnotation.groupName);

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
        },
    });

    useEffect(() => {
        setFocus('groupName');
    }, [setFocus]);

    useEffect(() => {
        const prevParameters: { [name: string]: boolean } = {};
        prevGroupAnnotation?.parameters?.forEach((name) => {
            prevParameters[name] = true;
        });

        reset({
            groupName: prevGroupAnnotation?.groupName || '',
            parameters: prevParameters,
        });
    }, [reset, prevGroupAnnotation]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: GroupFormState) => {
        dispatch(
            upsertGroup({
                target: targetPath,
                groupName: data.groupName,
                parameters: getSelectedParameters(),
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
            heading={`${prevGroupAnnotation ? 'Edit' : 'Add'} @group annotation`}
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
        </AnnotationForm>
    );
};
