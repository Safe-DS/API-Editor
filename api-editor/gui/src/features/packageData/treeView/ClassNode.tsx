import React from 'react';
import { FaChalkboard } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonClass from '../model/PythonClass';
import TreeNode from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { selectEnum, selectMove, selectRenaming, selectRemove } from '../../annotations/annotationSlice';

interface ClassNodeProps {
    pythonClass: PythonClass;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const ClassNode: React.FC<ClassNodeProps> = function ({ pythonClass, filter, usages }) {
    const hasMethods = !isEmptyList(pythonClass.methods);
    //const valuePair = getMapWithUsages(usages, pythonClass);
    const valuePair = getMapWithAnnotation(pythonClass);

    return (
        <TreeNode
            declaration={pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
            filter={filter}
            maxValue={valuePair[0]}
            specificValue={valuePair[1]}
        />
    );
};
//TODO: better return type
const getMapWithUsages = function (usages: UsageCountStore, pythonClass: PythonClass): [number, number] {
    const maxValue = usages.classMax;
    const specificValue = usages.classUsages.get(pythonClass.qualifiedName) ?? 0;
    return [maxValue, specificValue];
};

const getMapWithAnnotation = function (pythonClass: PythonClass): [number, number] {
    const maxValue = 3;
    const qname = pythonClass.pathAsString();
    let specificValue = 0;
    specificValue += useAppSelector(selectMove(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectRenaming(qname)) !== undefined ? 1 : 0;
    specificValue += useAppSelector(selectRemove(qname)) !== undefined ? 1 : 0;

    return [maxValue, specificValue];
};

export default ClassNode;
