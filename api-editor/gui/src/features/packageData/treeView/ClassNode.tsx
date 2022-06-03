import React from 'react';
import { FaChalkboard } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonClass from '../model/PythonClass';
import TreeNode from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';

interface ClassNodeProps {
    pythonClass: PythonClass;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const ClassNode: React.FC<ClassNodeProps> = function ({ pythonClass, filter, usages }) {
    const hasMethods = !isEmptyList(pythonClass.methods);

    return (
        <TreeNode
            declaration={pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
            filter={filter}
            usages={usages}
        />
    );
};

export default ClassNode;
