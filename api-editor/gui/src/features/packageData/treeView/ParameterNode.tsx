import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import PythonParameter from '../model/PythonParameter';
import TreeNode from './TreeNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import {UsageCountStore} from "../../usages/model/UsageCountStore";

interface ParameterNodeProps {
    pythonParameter: PythonParameter;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

const ParameterNode: React.FC<ParameterNodeProps> = function ({ pythonParameter, filter, usages }) {
    const maxValue = usages.parameterMax;
    const specificValue = usages.parameterUsages.get(pythonParameter.qualifiedName())?? 0;

    return <TreeNode declaration={pythonParameter} icon={FaKeyboard} isExpandable={false} filter={filter} maxValue={maxValue} specificValue={specificValue} />;
};

export default ParameterNode;
