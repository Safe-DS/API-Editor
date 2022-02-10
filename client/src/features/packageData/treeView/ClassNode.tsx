import React from 'react';
import { FaChalkboard } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonClass from '../model/PythonClass';
import TreeNode from './TreeNode';

interface ClassNodeProps {
    pythonClass: PythonClass;
}

const ClassNode: React.FC<ClassNodeProps> = function ({ pythonClass }) {
    const hasMethods = !isEmptyList(pythonClass.methods);

    return (
        <TreeNode
            declaration={pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
        />
    );
};

export default ClassNode;
