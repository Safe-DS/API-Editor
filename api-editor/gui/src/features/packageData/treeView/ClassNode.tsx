import React from 'react';
import {FaChalkboard} from 'react-icons/fa';
import {isEmptyList} from '../../../common/util/listOperations';
import PythonClass from '../model/PythonClass';
import TreeNode from './TreeNode';
import AbstractPythonFilter from "../model/filters/AbstractPythonFilter";

interface ClassNodeProps {
    pythonClass: PythonClass;
    filter: AbstractPythonFilter;
}

const ClassNode: React.FC<ClassNodeProps> = function ({ pythonClass, filter }) {
    const hasMethods = !isEmptyList(pythonClass.methods);

    return (
        <TreeNode
            declaration={pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
            filter={filter}
        />
    );
};

export default ClassNode;
