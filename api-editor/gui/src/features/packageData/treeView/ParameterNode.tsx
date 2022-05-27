import React from 'react';
import {FaKeyboard} from 'react-icons/fa';
import PythonParameter from '../model/PythonParameter';
import TreeNode from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import {UsageCountStore} from "../../usages/model/UsageCountStore";
import PythonClass from "../model/PythonClass";
import {useAppSelector} from "../../../app/hooks";
import {
    selectBoundary,
    selectConstant,
    selectEnum,
    selectMove, selectOptional,
    selectRenaming, selectRequired,
    selectUnused
} from "../../annotations/annotationSlice";

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const ParameterNode: React.FC<ParameterNodeProps> = function ({pythonParameter, filter, usages}) {
    //const valuePair = getMapWithUsages(usages, pythonParameter);
    const valuePair = getMapWithAnnotation(pythonParameter);

    return <TreeNode declaration={pythonParameter} icon={FaKeyboard} isExpandable={false} filter={filter}
                     maxValue={valuePair[0]} specificValue={valuePair[1]}/>;
};

const getMapWithUsages = function (usages: UsageCountStore, pythonParameter: PythonParameter): [number, number] {
    const maxValue = usages.parameterMax;
    const specificValue = usages.parameterUsages.get(pythonParameter.qualifiedName()) ?? 0;
    return [maxValue, specificValue];
}

const getMapWithAnnotation = function (pythonParameter: PythonParameter): [number, number] {
    const maxValue = 6;
    const qname = pythonParameter.pathAsString();
    let specificValue = 0;
    specificValue += useAppSelector(selectBoundary(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectEnum(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectConstant(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectOptional(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectRequired(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectRenaming(qname)) !== undefined ? 1 : 0;

    return [maxValue, specificValue];
}

export default ParameterNode;
