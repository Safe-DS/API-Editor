import React from 'react';
import { FaChalkboard } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import { PythonClass } from '../model/PythonClass';
import { TreeNode, ValuePair } from './TreeNode';
import { AbstractPythonFilter } from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { maximumNumberOfClassAnnotations, selectNumberOfAnnotations } from '../../annotations/annotationSlice';
import { HeatMapMode, selectHeatMapMode } from '../../ui/uiSlice';

interface ClassNodeProps {
    pythonClass: PythonClass;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const ClassNode: React.FC<ClassNodeProps> = function ({ pythonClass, filter, usages }) {
    const hasMethods = !isEmptyList(pythonClass.methods);
    const annotationCounts = useAnnotationCounts(pythonClass);
    const heatMapMode = useAppSelector(selectHeatMapMode);

    let valuePair: ValuePair = new ValuePair(0, 1);
    if (heatMapMode === HeatMapMode.Annotations) {
        valuePair = annotationCounts;
    } else if (heatMapMode === HeatMapMode.Usages || heatMapMode === HeatMapMode.Usefulness) {
        valuePair = getMapWithUsages(usages, pythonClass);
    }

    return (
        <TreeNode
            declaration={pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
            filter={filter}
            usages={usages}
            maxValue={valuePair.maxValue}
            specificValue={valuePair.specificValue}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonClass: PythonClass): ValuePair {
    const maxValue = usages.classMaxUsages;
    const specificValue = usages.classUsages.get(pythonClass.id) ?? 0;
    return new ValuePair(specificValue, maxValue);
};

const useAnnotationCounts = function (pythonClass: PythonClass): ValuePair {
    return new ValuePair(
        useAppSelector(selectNumberOfAnnotations(pythonClass.id)),
        maximumNumberOfClassAnnotations);
};
