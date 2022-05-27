import React from 'react';
import { FaCogs } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonFunction from '../model/PythonFunction';
import TreeNode from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';

interface FunctionNodeProps {
    pythonFunction: PythonFunction;
    filter: AbstractPythonFilter;
}

const FunctionNode: React.FC<FunctionNodeProps> = function ({ pythonFunction, filter }) {
    const hasParameters = !isEmptyList(pythonFunction.parameters);

    return <TreeNode declaration={pythonFunction} icon={FaCogs} isExpandable={hasParameters} filter={filter} />;
};

export default FunctionNode;
