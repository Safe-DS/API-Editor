import React, { useEffect } from 'react';
import { PythonPackage } from '../packageData/model/PythonPackage';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { AnnotationStore, DefaultValue, DefaultValueType } from '../annotations/versioning/AnnotationStoreV2';
import { useAppSelector } from '../../app/hooks';
import { selectRawPythonPackage } from '../packageData/apiSlice';
import { selectUsages } from '../usages/usageSlice';
import { selectAnnotationStore } from '../annotations/annotationSlice';
import { createFilterFromString } from '../filter/model/filterFactory';
import { AbstractPythonFilter } from '../filter/model/AbstractPythonFilter';
import { PythonParameterAssignment } from '../packageData/model/PythonParameter';

export const PaperStatistics = function () {
    const pythonPackage = useAppSelector(selectRawPythonPackage);
    const usages = useAppSelector(selectUsages);
    const annotations = useAppSelector(selectAnnotationStore);

    useEffect(() => {
        apiSize(pythonPackage, usages, annotations);
        optionalAndRequired(pythonPackage, usages, annotations, 1);
        optionalAndRequired(pythonPackage, usages, annotations, 10);
    }, [pythonPackage, usages, annotations]);

    return <>Test</>;
};

const apiSize = function (pythonPackage: PythonPackage, usages: UsageCountStore, annotations: AnnotationStore) {
    const counter = countMatches(pythonPackage, usages, annotations);
    const classesPublicFilter = createFilterFromString('is:class is:public');
    const functionsPublicFilter = createFilterFromString('is:function is:public');
    const parameterPublicFilter = createFilterFromString('is:parameter is:public !is:implicit');

    const byThreshold: string[] = [];

    for (let threshold = 1; threshold <= 100; threshold++) {
        const classesUsedFilter = createFilterFromString(`is:class is:public usages:>=${threshold}`);
        const functionsUsedFilter = createFilterFromString(`is:function is:public usages:>=${threshold}`);
        const parametersUsedFilter = createFilterFromString(
            `is:parameter is:public !is:implicit usages:>=${threshold}`,
        );
        const parametersUsefulFilter = createFilterFromString(
            `is:parameter is:public !is:implicit usefulness:>=${threshold}`,
        );

        byThreshold.push(
            `  ${threshold} -> <|classesUsed->${counter(classesUsedFilter)}, functionsUsed->${counter(
                functionsUsedFilter,
            )}, parametersUsed->${counter(parametersUsedFilter)}, parametersUseful->${counter(
                parametersUsefulFilter,
            )}|>`,
        );
    }

    console.log(`classesPublic = ${counter(classesPublicFilter)};
functionsPublic = ${counter(functionsPublicFilter)};
parameterPublic = ${counter(parameterPublicFilter)};
byThreshold = <|\n${byThreshold.join(',\n')}\n|>;
    `);
};

const countMatches =
    (pythonPackage: PythonPackage, usages: UsageCountStore, annotations: AnnotationStore) =>
    (filter: AbstractPythonFilter) => {
        let result = 0;
        for (const declaration of pythonPackage.descendantsOrSelf()) {
            if (
                !(declaration instanceof PythonPackage) &&
                filter.shouldKeepDeclaration(declaration, annotations, usages)
            ) {
                result++;
            }
        }
        return result;
    };

const optionalAndRequired = function (
    pythonPackage: PythonPackage,
    usages: UsageCountStore,
    annotations: AnnotationStore,
    threshold: number,
) {
    const parametersUsefulFilter = createFilterFromString(
        `is:parameter is:public !is:implicit usefulness:>=${threshold}`,
    );

    const publicParameters = parametersUsefulFilter.applyToPackage(pythonPackage, annotations, usages).getParameters();
    const requiredParameters = publicParameters.filter((parameter) => parameter.defaultValue === null);
    const optionalParameters = publicParameters.filter((parameter) => parameter.defaultValue !== null);

    const requiredToRequired = requiredParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        if (!annotation) {
            return true;
        }

        return annotation.variant === 'required';
    }).length;
    const requiredToOptional = requiredParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        return annotation?.variant === 'optional';
    }).length;
    const requiredToConstant = requiredParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        return annotation?.variant === 'constant';
    }).length;
    const optionalToRequired = optionalParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        return annotation?.variant === 'required';
    }).length;
    const optionalToOptionalWithSameDefault = optionalParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        if (!annotation) {
            return true;
        }

        return (
            annotation?.variant === 'optional' &&
            parameter.defaultValue === stringifiedValue(annotation.defaultValueType, annotation.defaultValue)
        );
    }).length;
    const optionalToOptionalWithDifferentDefault = optionalParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        return (
            annotation?.variant === 'optional' &&
            parameter.defaultValue !== stringifiedValue(annotation.defaultValueType, annotation.defaultValue)
        );
    }).length;
    const optionalToConstantWithSameDefault = optionalParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        if (!annotation) {
            return false;
        }

        if (annotation.variant === 'omitted') {
            return true;
        }

        return (
            annotation.variant === 'constant' &&
            parameter.defaultValue === stringifiedValue(annotation.defaultValueType, annotation.defaultValue)
        );
    }).length;
    const optionalToConstantWithDifferentDefault = optionalParameters.filter((parameter) => {
        const annotation = annotations.valueAnnotations[parameter.id];
        return (
            annotation?.variant === 'constant' &&
            parameter.defaultValue !== stringifiedValue(annotation.defaultValueType, annotation.defaultValue)
        );
    }).length;

    console.log(`
originalPublic: ${publicParameters.length}
originalRequired: ${requiredParameters.length}
originalOptional: ${optionalParameters.length}

requiredToRequired: ${requiredToRequired}
requiredToOptional: ${requiredToOptional}
requiredToConstant: ${requiredToConstant}

optionalToRequired: ${optionalToRequired}
optionalToOptionalWithSameDefault: ${optionalToOptionalWithSameDefault}
optionalToOptionalWithDifferentDefault: ${optionalToOptionalWithDifferentDefault}
optionalToConstantWithSameDefault: ${optionalToConstantWithSameDefault}
optionalToConstantWithDifferentDefault: ${optionalToConstantWithDifferentDefault}
`);
};

const stringifiedValue = function (
    defaultValueType: DefaultValueType | undefined,
    defaultValue: DefaultValue | undefined,
): string {
    switch (defaultValueType) {
        case 'string':
            return `'${defaultValue}'`;
        case 'number':
            return String(defaultValue);
        case 'boolean':
            return defaultValue ? 'True' : 'False';
        case 'none':
            return 'None';
        default:
            return '???';
    }
};
