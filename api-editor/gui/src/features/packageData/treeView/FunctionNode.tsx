import React from 'react';
import { FaCogs } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonFunction from '../model/PythonFunction';
import { TreeNode, ValuePair } from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { AnnotationsState, selectAnnotations } from '../../annotations/annotationSlice';
import {HeatMapMode, selectHeatMapMode} from "../../ui/uiSlice";

interface FunctionNodeProps {
    pythonFunction: PythonFunction;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const FunctionNode: React.FC<FunctionNodeProps> = function ({ pythonFunction, filter, usages }) {
    const hasParameters = !isEmptyList(pythonFunction.parameters);
    const annotations = useAppSelector(selectAnnotations);
    const heatMapMode = useAppSelector(selectHeatMapMode);
    let valuePair: ValuePair = new ValuePair(undefined, undefined);

    if (heatMapMode === HeatMapMode.Annotations) {
        valuePair = getMapWithAnnotation(pythonFunction, annotations);
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
    specificValue += annotations.removes[qname] !== undefined ? 1 : 0;
    specificValue += annotations.groups[qname] !== undefined ? 1 : 0;
    specificValue += annotations.moves[qname] !== undefined ? 1 : 0;

    return new ValuePair(specificValue, maxValue);
};
