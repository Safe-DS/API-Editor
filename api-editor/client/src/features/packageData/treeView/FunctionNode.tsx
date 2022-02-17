import React from 'react';
import { FaCogs } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonFunction from '../model/PythonFunction';
import TreeNode from './TreeNode';
import {useAppSelector} from "../../../app/hooks";
import {selectShowPrivateDeclarations} from "../packageDataSlice";

interface FunctionNodeProps {
    pythonFunction: PythonFunction;
}

const FunctionNode: React.FC<FunctionNodeProps> = function ({
    pythonFunction,
}) {
    let parameters = pythonFunction.parameters
    if (!useAppSelector(selectShowPrivateDeclarations)) {
        parameters = parameters.filter((it) => it.isPublic)
    }
    const hasParameters = !isEmptyList(parameters);

    return (
        <TreeNode
            declaration={pythonFunction}
            icon={FaCogs}
            isExpandable={hasParameters}
        />
    );
};

export default FunctionNode;
