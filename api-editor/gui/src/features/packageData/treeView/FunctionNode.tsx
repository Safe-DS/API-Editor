import React from 'react';
import { FaCogs } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonFunction from '../model/PythonFunction';
import TreeNode, { ValuePair } from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { AnnotationsState, selectAnnotations } from '../../annotations/annotationSlice';
import { HeatMapData, selectHeatMapData } from '../packageDataSlice';

interface FunctionNodeProps {
    pythonFunction: PythonFunction;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const FunctionNode: React.FC<FunctionNodeProps> = function ({ pythonFunction, filter, usages }) {
    const hasParameters = !isEmptyList(pythonFunction.parameters);
    const annotations = useAppSelector(selectAnnotations);
    let valuePair: ValuePair = new ValuePair(undefined, undefined);

    if (useAppSelector(selectHeatMapData) === HeatMapData.Usages) {
        valuePair = getMapWithUsages(usages, pythonFunction);
    } else if (useAppSelector(selectHeatMapData) === HeatMapData.Usages) {
        valuePair = getMapWithAnnotation(pythonFunction, annotations);
    }

    return (
        <TreeNode
            declaration={pythonFunction}
            icon={FaCogs}
            isExpandable={hasParameters}
            filter={filter}
            maxValue={valuePair.maxValue}
            specificValue={valuePair.specificValue}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonFunction: PythonFunction): ValuePair {
    const maxValue = usages.functionMax;
    const specificValue = usages.functionUsages.get(pythonFunction.qualifiedName) ?? 0;

    return new ValuePair(specificValue, maxValue);
};

const getMapWithAnnotation = function (pythonFunction: PythonFunction, annotations: AnnotationsState): ValuePair {
    const maxValue = 6;
    const qname = pythonFunction.pathAsString();
    let specificValue = 0;

    specificValue += annotations.calledAfters[qname] !== undefined ? 1 : 0;
    specificValue += annotations.pures[qname] !== undefined ? 1 : 0;
    specificValue += annotations.renamings[qname] !== undefined ? 1 : 0;
    specificValue += annotations.unuseds[qname] !== undefined ? 1 : 0;
    specificValue += annotations.groups[qname] !== undefined ? 1 : 0;
    specificValue += annotations.moves[qname] !== undefined ? 1 : 0;

    return new ValuePair(specificValue, maxValue);
};

export default FunctionNode;
