import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import PythonParameter from '../model/PythonParameter';
import { TreeNode, ValuePair } from './TreeNode';
import { AbstractPythonFilter } from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { AnnotationStore, selectAnnotations } from '../../annotations/annotationSlice';
import { HeatMapMode, selectHeatMapMode } from '../../ui/uiSlice';

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const ParameterNode: React.FC<ParameterNodeProps> = function ({ pythonParameter, filter, usages }) {
    let valuePair: ValuePair = new ValuePair(undefined, undefined);
    const heatMapMode = useAppSelector(selectHeatMapMode);
    const annotations = useAppSelector(selectAnnotations);

    if (heatMapMode === HeatMapMode.Annotations) {
        valuePair = getMapWithAnnotation(pythonParameter, annotations);
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
    const specificValue = usages.parameterUsages.get(pythonParameter.qualifiedName()) ?? 0;
    return new ValuePair(specificValue, maxValue);
};

const getMapWithUsefulness = function (usages: UsageCountStore, pythonParameter: PythonParameter): ValuePair {
    const maxValue = usages.parameterMaxUsefulness;
    const specificValue = usages.parameterUsefulness.get(pythonParameter.qualifiedName()) ?? 0;
    return new ValuePair(specificValue, maxValue);
};

const getMapWithAnnotation = function (pythonParameter: PythonParameter, annotations: AnnotationStore): ValuePair {
    const maxValue = 7;
    const qname = pythonParameter.pathAsString();
    let specificValue = 0;

    specificValue += annotations.attributes[qname] !== undefined ? 1 : 0;
    specificValue += annotations.boundaries[qname] !== undefined ? 1 : 0;
    specificValue += annotations.enums[qname] !== undefined ? 1 : 0;
    specificValue += annotations.constants[qname] !== undefined ? 1 : 0;
    specificValue += annotations.optionals[qname] !== undefined ? 1 : 0;
    specificValue += annotations.requireds[qname] !== undefined ? 1 : 0;
    specificValue += annotations.renamings[qname] !== undefined ? 1 : 0;

    return new ValuePair(specificValue, maxValue);
};
