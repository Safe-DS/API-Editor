import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import { PythonParameter } from '../model/PythonParameter';
import { TreeNode, ValuePair } from './TreeNode';
import { AbstractPythonFilter } from '../../filter/model/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { maximumNumberOfParameterAnnotations, selectNumberOfAnnotationsOnTarget } from '../../annotations/annotationSlice';
import { HeatMapMode, selectHeatMapMode } from '../../ui/uiSlice';

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const ParameterNode: React.FC<ParameterNodeProps> = function ({ pythonParameter, filter, usages }) {
    const annotationCounts = useAnnotationCounts(pythonParameter);
    const heatMapMode = useAppSelector(selectHeatMapMode);

    let valuePair: ValuePair = new ValuePair(undefined, undefined);
    if (heatMapMode === HeatMapMode.Annotations) {
        valuePair = annotationCounts;
    } else if (heatMapMode === HeatMapMode.Usages) {
        valuePair = getMapWithUsages(usages, pythonParameter);
    } else if (heatMapMode === HeatMapMode.Usefulness) {
        valuePair = getMapWithUsefulness(usages, pythonParameter);
    }

    return (
        <TreeNode
            declaration={pythonParameter}
            icon={FaKeyboard}
            isExpandable={false}
            filter={filter}
            usages={usages}
            maxValue={valuePair.maxValue}
            specificValue={valuePair.specificValue}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonParameter: PythonParameter): ValuePair {
    const maxValue = usages.parameterMaxUsages;
    const specificValue = usages.parameterUsages.get(pythonParameter.id) ?? 0;
    return new ValuePair(specificValue, maxValue);
};

const getMapWithUsefulness = function (usages: UsageCountStore, pythonParameter: PythonParameter): ValuePair {
    const maxValue = usages.parameterMaxUsefulness;
    const specificValue = usages.parameterUsefulness.get(pythonParameter.id) ?? 0;
    return new ValuePair(specificValue, maxValue);
};

const useAnnotationCounts = function (pythonParameter: PythonParameter): ValuePair {
    return new ValuePair(
        useAppSelector(selectNumberOfAnnotationsOnTarget(pythonParameter.id)),
        maximumNumberOfParameterAnnotations,
    );
};
