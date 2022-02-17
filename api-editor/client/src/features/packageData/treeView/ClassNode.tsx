import React from 'react';
import { FaChalkboard } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonClass from '../model/PythonClass';
import TreeNode from './TreeNode';
import {useAppSelector} from "../../../app/hooks";
import {selectShowPrivateDeclarations} from "../packageDataSlice";

interface ClassNodeProps {
    pythonClass: PythonClass;
}

const ClassNode: React.FC<ClassNodeProps> = function ({ pythonClass }) {
    let methods = pythonClass.methods
    if (!useAppSelector(selectShowPrivateDeclarations)) {
        methods = methods.filter((it) => it.isPublic)
    }
    const hasMethods = !isEmptyList(methods);

    return (
        <TreeNode
            declaration={pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
        />
    );
};

export default ClassNode;
