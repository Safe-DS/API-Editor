import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import PythonParameter from '../model/PythonParameter';
import TreeNode from './TreeNode';

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
}

const ParameterNode: React.FC<ParameterNodeProps> = ({ pythonParameter }) => (
    <TreeNode
        declaration={pythonParameter}
        icon={FaKeyboard}
        isExpandable={false}
    />
);

export default ParameterNode;
