import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import PythonParameter from '../model/PythonParameter';
import TreeNode, { ValuePair } from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { AnnotationsState, selectAnnotations } from '../../annotations/annotationSlice';
import { HeatMapMode, selectHeatMapMode } from '../packageDataSlice';

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const ParameterNode: React.FC<ParameterNodeProps> = function ({ pythonParameter, filter, usages }) {
    let valuePair: ValuePair = new ValuePair(undefined, undefined);
    const annotations = useAppSelector(selectAnnotations);

    if (useAppSelector(selectHeatMapMode) === HeatMapMode.Usages) {
        valuePair = getMapWithUsages(usages, pythonParameter);
    } else if (useAppSelector(selectHeatMapMode) === HeatMapMode.Usages) {
        valuePair = getMapWithAnnotation(pythonParameter, annotations);
    }

    return (
        <TreeNode
            declaration={pythonParameter}
            icon={FaKeyboard}
            isExpandable={false}
            filter={filter}
            maxValue={valuePair.maxValue}
            specificValue={valuePair.specificValue}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonParameter: PythonParameter): ValuePair {
    const maxValue = usages.parameterMax;
    const specificValue = usages.parameterUsages.get(pythonParameter.qualifiedName()) ?? 0;
    return new ValuePair(specificValue, maxValue);
};

const getMapWithAnnotation = function (pythonParameter: PythonParameter, annotations: AnnotationsState): ValuePair {
    const maxValue = 6;
    const qname = pythonParameter.pathAsString();
    let specificValue = 0;

    specificValue += annotations.boundaries[qname] !== undefined ? 1 : 0;
    specificValue += annotations.enums[qname] !== undefined ? 1 : 0;
    specificValue += annotations.constants[qname] !== undefined ? 1 : 0;
    specificValue += annotations.optionals[qname] !== undefined ? 1 : 0;
    specificValue += annotations.requireds[qname] !== undefined ? 1 : 0;
    specificValue += annotations.renamings[qname] !== undefined ? 1 : 0;

    return new ValuePair(specificValue, maxValue);
};

export default ParameterNode;
