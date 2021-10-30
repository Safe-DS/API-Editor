import {Checkbox, FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input, VStack,} from '@chakra-ui/react';
import React, {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import {pythonIdentifierPattern} from '../../../common/validation';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import PythonFunction from '../../packageData/model/PythonFunction';
import PythonParameter from '../../packageData/model/PythonParameter';
import {GroupAnnotation, hideAnnotationForms, removeGroup, selectGroups, upsertGroup,} from '../annotationSlice';
import AnnotationForm from './AnnotationForm';

interface GroupFormProps {
    readonly target: PythonDeclaration;
    readonly groupName?: string;
}

interface GroupFormState {
    groupName: string;
    parameters: { [name: string]: boolean };
    dummy: string;
}

const GroupForm1: React.FC<GroupFormProps> = function ({
                                                          target,
                                                          groupName,
                                                      }: GroupFormProps) {
    const targetPath = target.pathAsString();
    const currentGroups = useAppSelector(selectGroups(targetPath));
    let prevGroupAnnotation: GroupAnnotation | undefined;
    if (groupName && currentGroups) {
        prevGroupAnnotation = currentGroups[groupName];
    }
    let otherGroupNames: string[] = [];
    if (currentGroups) {
        otherGroupNames = Object.values(currentGroups)
            .filter(
                (group) => group.groupName !== prevGroupAnnotation?.groupName,
            )
            .map((group) => group.groupName);
    }

    let allParameters: PythonParameter[] = [];

    if (target instanceof PythonFunction) {
        allParameters = target.children();
    }

    const buildAlreadyUsedName = (name: string, usedIn: string) =>
        `${name} (already used in ${usedIn})`;

    const getParameterLabel = (name: string) => {
        if (!currentGroups) {
            return name;
        }

        for (const group of otherGroupNames) {
            if (
                currentGroups[group]?.parameters?.some(
                    (parameter) => parameter === name,
                )
            ) {
                if (
                    !prevGroupAnnotation ||
                    (prevGroupAnnotation &&
                        currentGroups[group].groupName !==
                        prevGroupAnnotation.groupName)
                ) {
                    return buildAlreadyUsedName(
                        name,
                        currentGroups[group].groupName,
                    );
                }
            }
        }
        return name;
    };

    const updateOtherGroups = () => {
        if (currentGroups) {
            for (const nameOfGroup of otherGroupNames) {
                let needsChange = false;
                const group = currentGroups[nameOfGroup];
                const currentAnnotationParameter = getSelectedParameters();
                const currentGroupParameter = [...group.parameters];
                for (const parameter of currentAnnotationParameter) {
                    const index = currentGroupParameter.indexOf(parameter);
                    if (index > -1) {
                        needsChange = true;
                        currentGroupParameter.splice(index, 1);
                    }
                }
                if (currentGroupParameter.length < 1) {
                    dispatch(
                        removeGroup({
                            target: targetPath,
                            groupName: group.groupName,
                        }),
                    );
                } else if (needsChange) {
                    dispatch(
                        upsertGroup({
                            parameters: currentGroupParameter,
                            groupName: group.groupName,
                            target: group.target,
                        }),
                    );
                }
            }
        }
    };

    const getSelectedParameters = (): string[] => Object.entries(getValues('parameters'))
        .filter(([, isSelected]) => isSelected)
        .map(([name,]) => name)

    const checkedAtLeastOne = () =>
        getSelectedParameters().length >= 1;

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch();
    const {
        getValues,
        handleSubmit,
        setFocus,
        register,
        reset,
        formState: {errors},
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
        const prevParameters: { [name: string]: boolean } = {}
        prevGroupAnnotation?.parameters?.forEach(name => {
            prevParameters[name] = true
        })

        reset({
            groupName: prevGroupAnnotation?.groupName || '',
            parameters: prevParameters,
        });
    }, [reset, prevGroupAnnotation]);

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: GroupFormState) => {
        updateOtherGroups();
        dispatch(
            upsertGroup({
                target: targetPath,
                groupName: data.groupName,
                parameters: getSelectedParameters()
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
                prevGroupAnnotation ? 'Edit' : 'Add'
            } @group annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors?.groupName)}>
                <FormLabel>Function &quot;{target.name}&quot;:</FormLabel>
                <Input
                    placeholder="Name of parameter object"
                    {...register('groupName', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon/> {errors.groupName?.message}
                </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={Boolean(errors?.parameters)}>
                <VStack alignItems="left">
                    {allParameters.map((parameter) => (
                        <Checkbox
                            key={parameter.name}
                            {...register(`parameters.${parameter.name}`)}
                        >
                            {getParameterLabel(parameter.name)}
                        </Checkbox>
                    ))}
                </VStack>
            </FormControl>

            <FormControl isInvalid={"dummy" in errors}>
                <Input type="hidden"
                       {...register("dummy", {
                           validate: () => checkedAtLeastOne()
                       })}

                       onChange={() => {
                       }}
                />
                <FormErrorMessage>
                    <FormErrorIcon/>
                    {errors.dummy &&
                        'At least one parameter needs to be selected.'}
                </FormErrorMessage>
            </FormControl>

        </AnnotationForm>
    );
};

export default GroupForm1;
