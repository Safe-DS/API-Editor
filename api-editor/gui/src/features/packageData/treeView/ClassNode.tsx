import React from 'react';
import { FaChalkboard } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonClass from '../model/PythonClass';
import TreeNode, { ValuePair } from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { AnnotationsState, selectAnnotations } from '../../annotations/annotationSlice';
import { HeatMapMode, selectHeatMapMode } from '../packageDataSlice';

interface ClassNodeProps {
    pythonClass: PythonClass;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const ClassNode: React.FC<ClassNodeProps> = function ({ pythonClass, filter, usages }) {
    const hasMethods = !isEmptyList(pythonClass.methods);
    const annotations = useAppSelector(selectAnnotations);
    const heatMapMode = useAppSelector(selectHeatMapMode);
    let valuePair: ValuePair = new ValuePair(undefined, undefined);

    if (heatMapMode === HeatMapMode.Annotations) {
        valuePair = getMapWithAnnotation(pythonClass, annotations);
    } else if (heatMapMode === HeatMapMode.Usages) {
        valuePair = getMapWithUsages(usages, pythonClass);
    }

    return (
        <TreeNode
            declaration={pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
            filter={filter}
            maxValue={valuePair.maxValue}
            specificValue={valuePair.specificValue}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonClass: PythonClass): ValuePair {
    const maxValue = usages.classMax;
    const specificValue = usages.classUsages.get(pythonClass.qualifiedName) ?? 0;
    return new ValuePair(specificValue, maxValue);
};

const getMapWithAnnotation = function (pythonClass: PythonClass, annotations: AnnotationsState): ValuePair {
    const maxValue = 3;
    const qname = pythonClass.pathAsString();
    let specificValue = 0;

    specificValue += annotations.moves[qname] !== undefined ? 1 : 0;
    specificValue += annotations.renamings[qname] !== undefined ? 1 : 0;
    specificValue += annotations.removes[qname] !== undefined ? 1 : 0;

    return new ValuePair(specificValue, maxValue);
};

export default ClassNode;
