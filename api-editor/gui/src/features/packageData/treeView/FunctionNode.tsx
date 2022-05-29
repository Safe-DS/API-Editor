import React from 'react';
import {FaCogs} from 'react-icons/fa';
import {isEmptyList} from '../../../common/util/listOperations';
import PythonFunction from '../model/PythonFunction';
import TreeNode from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import {UsageCountStore} from '../../usages/model/UsageCountStore';
import {useAppSelector} from '../../../app/hooks';
import {
    selectCalledAfters,
    selectGroups,
    selectMove,
    selectPure,
    selectRemove,
    selectRenaming,
} from '../../annotations/annotationSlice';

interface FunctionNodeProps {
    pythonFunction: PythonFunction;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const FunctionNode: React.FC<FunctionNodeProps> = function ({ pythonFunction, filter, usages }) {
    const hasParameters = !isEmptyList(pythonFunction.parameters);
    //const valuePair = getMapWithUsages(usages, pythonFunction);
    const valuePair = getMapWithAnnotation(pythonFunction);

    return (
        <TreeNode
            declaration={pythonFunction}
            icon={FaCogs}
            isExpandable={hasParameters}
            filter={filter}
            maxValue={valuePair[0]}
            specificValue={valuePair[1]}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonFunction: PythonFunction): [number, number] {
    const maxValue = usages.functionMax;
    const specificValue = usages.functionUsages.get(pythonFunction.qualifiedName) ?? 0;

    return [maxValue, specificValue];
};

const getMapWithAnnotation = function (pythonFunction: PythonFunction): [number, number] {
    const maxValue = 4;
    const qname = pythonFunction.pathAsString();
    let specificValue = 0;

    specificValue += Object.entries(useAppSelector(selectCalledAfters(qname))).length !== 0 ? 1 : 0;
    specificValue += useAppSelector(selectPure(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectRenaming(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectRemove(qname)) !== undefined ? 1 : 0;
    specificValue += Object.entries(useAppSelector(selectGroups(qname))).length !== 0 ? 1 : 0;
    specificValue += useAppSelector(selectMove(qname)) !== undefined ? 1 : 0;
    return [maxValue, specificValue];
};

export default FunctionNode;
