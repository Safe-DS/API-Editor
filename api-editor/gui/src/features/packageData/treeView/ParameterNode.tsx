import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import PythonParameter from '../model/PythonParameter';
import TreeNode from './TreeNode';
import AbstractPythonFilter from "../model/filters/AbstractPythonFilter";

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    filter: AbstractPythonFilter;
}

const ParameterNode: React.FC<ParameterNodeProps> = function ({
    pythonParameter,
    filter
}) {
    return (
        <TreeNode
            declaration={pythonParameter}
            icon={FaKeyboard}
            isExpandable={false}
            filter={filter}
        />
    );
};

export default ParameterNode;
