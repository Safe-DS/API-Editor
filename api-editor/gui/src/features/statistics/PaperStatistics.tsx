import React, { useEffect } from 'react';
import { PythonPackage } from '../packageData/model/PythonPackage';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { AnnotationStore } from '../annotations/versioning/AnnotationStoreV2';
import { useAppSelector } from '../../app/hooks';
import { selectRawPythonPackage } from '../packageData/apiSlice';
import { selectUsages } from '../usages/usageSlice';
import { selectAnnotationStore } from '../annotations/annotationSlice';
import { createFilterFromString } from '../filter/model/filterFactory';
import { AbstractPythonFilter } from '../filter/model/AbstractPythonFilter';

export const PaperStatistics = function () {
    const pythonPackage = useAppSelector(selectRawPythonPackage);
    const usages = useAppSelector(selectUsages);
    const annotations = useAppSelector(selectAnnotationStore);

    useEffect(() => {
        apiSize(pythonPackage, usages, annotations);
    }, [pythonPackage, usages, annotations])

    return <>Test</>;
};

const apiSize = function (pythonPackage: PythonPackage, usages: UsageCountStore, annotations: AnnotationStore) {
    const counter = countMatches(pythonPackage, usages, annotations)
    const classesPublicFilter = createFilterFromString('is:class is:public');
    const functionsPublicFilter = createFilterFromString('is:function is:public');
    const parameterPublicFilter = createFilterFromString('is:parameter is:public !is:implicit');

    const byThreshold: string[] = []

    for (let threshold = 0; threshold <= 99; threshold++) {
        const classesUsedFilter = createFilterFromString(`is:class is:public usages:>${threshold}`)
        const functionsUsedFilter = createFilterFromString(`is:function is:public usages:>${threshold}`)
        const parametersUsedFilter = createFilterFromString(`is:parameter is:public !is:implicit usages:>${threshold}`)
        const parametersUsefulFilter = createFilterFromString(`is:parameter is:public !is:implicit usefulness:>${threshold}`)

        byThreshold.push(`  ${threshold} -> <|classesUsed->${counter(classesUsedFilter)}, functionsUsed->${counter(functionsUsedFilter)}, parametersUsed->${counter(parametersUsedFilter)}, parametersUseful->${counter(parametersUsefulFilter)}|>`)
    }

    console.log(`classesPublic = ${counter(classesPublicFilter)};
functionsPublic = ${counter(functionsPublicFilter)};
parameterPublic = ${counter(parameterPublicFilter)};
byThreshold = <|\n${byThreshold.join(",\n")}\n|>;
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
