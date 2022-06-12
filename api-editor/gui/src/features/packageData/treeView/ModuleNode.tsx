import React from 'react';
import { FaArchive } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import { PythonModule } from '../model/PythonModule';
import { TreeNode } from './TreeNode';
import { AbstractPythonFilter } from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';

interface ModuleNodeProps {
    pythonModule: PythonModule;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const ModuleNode: React.FC<ModuleNodeProps> = function ({ pythonModule, filter, usages }) {
    const hasClasses = !isEmptyList(pythonModule.classes);
    const hasFunctions = !isEmptyList(pythonModule.functions);
    const hasChildren = hasClasses || hasFunctions;

    return (
        <TreeNode
            declaration={pythonModule}
            icon={FaArchive}
            isExpandable={hasChildren}
            filter={filter}
            usages={usages}
        />
    );
};
