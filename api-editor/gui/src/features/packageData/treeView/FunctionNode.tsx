import React from 'react';
import {FaCogs} from 'react-icons/fa';
import {isEmptyList} from '../../../common/util/listOperations';
import PythonFunction from '../model/PythonFunction';
import TreeNode from './TreeNode';

interface FunctionNodeProps {
    pythonFunction: PythonFunction;
}

const FunctionNode: React.FC<FunctionNodeProps> = function ({
    pythonFunction,
}) {
    const hasParameters = !isEmptyList(pythonFunction.parameters);

    return (
        <TreeNode
            declaration={pythonFunction}
            icon={FaCogs}
            isExpandable={hasParameters}
        />
    );
};

export default FunctionNode;
