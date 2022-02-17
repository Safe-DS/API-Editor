import React from 'react';
import { FaArchive } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import PythonModule from '../model/PythonModule';
import TreeNode from './TreeNode';
import { useAppSelector } from '../../../app/hooks';
import { selectShowPrivateDeclarations } from '../packageDataSlice';

interface ModuleNodeProps {
    pythonModule: PythonModule;
}

const ModuleNode: React.FC<ModuleNodeProps> = function ({ pythonModule }) {
    let classes = pythonModule.classes;
    if (!useAppSelector(selectShowPrivateDeclarations)) {
        classes = classes.filter((it) => it.isPublic);
    }
    const hasClasses = !isEmptyList(classes);
    let functions = pythonModule.functions;
    if (!useAppSelector(selectShowPrivateDeclarations)) {
        functions = functions.filter((it) => it.isPublic);
    }
    const hasFunctions = !isEmptyList(functions);
    const hasChildren = hasClasses || hasFunctions;

    return (
        <TreeNode
            declaration={pythonModule}
            icon={FaArchive}
            isExpandable={hasChildren}
        />
    );
};

export default ModuleNode;
