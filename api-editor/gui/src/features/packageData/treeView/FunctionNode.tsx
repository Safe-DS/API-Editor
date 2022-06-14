import React from 'react';
import { FaCogs } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import { PythonFunction } from '../model/PythonFunction';
import { TreeNode, ValuePair } from './TreeNode';
import { AbstractPythonFilter } from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { maximumNumberOfFunctionAnnotations, selectNumberOfAnnotations } from '../../annotations/annotationSlice';
import { HeatMapMode, selectHeatMapMode } from '../../ui/uiSlice';

interface FunctionNodeProps {
    pythonFunction: PythonFunction;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const FunctionNode: React.FC<FunctionNodeProps> = function ({ pythonFunction, filter, usages }) {
    const hasParameters = !isEmptyList(pythonFunction.parameters);
    const annotationCounts = useAnnotationCounts(pythonFunction);
    const heatMapMode = useAppSelector(selectHeatMapMode);

    let valuePair: ValuePair = new ValuePair(0, 1);
    if (heatMapMode === HeatMapMode.Annotations) {
        valuePair = annotationCounts;
    } else if (heatMapMode === HeatMapMode.Usages || heatMapMode === HeatMapMode.Usefulness) {
        valuePair = getMapWithUsages(usages, pythonFunction);
    }

    return (
        <TreeNode
            declaration={pythonFunction}
            icon={FaCogs}
            isExpandable={hasParameters}
            filter={filter}
            usages={usages}
            maxValue={valuePair.maxValue}
            specificValue={valuePair.specificValue}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonFunction: PythonFunction): ValuePair {
    const maxValue = usages.functionMaxUsages;
    const specificValue = usages.functionUsages.get(pythonFunction.id) ?? 0;

    return new ValuePair(specificValue, maxValue);
};

const useAnnotationCounts = function (pythonFunction: PythonFunction): ValuePair {
    return new ValuePair(
        useAppSelector(selectNumberOfAnnotations(pythonFunction.id)),
        maximumNumberOfFunctionAnnotations);
};
