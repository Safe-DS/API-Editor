import React from 'react';
import { FaArchive } from 'react-icons/fa';
import { isEmptyList } from '../../../common/util/listOperations';
import { PythonModule } from '../model/PythonModule';
import { TreeNode, ValuePair } from './TreeNode';
import { AbstractPythonFilter } from '../../filter/model/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { useAppSelector } from '../../../app/hooks';
import { HeatMapMode, selectHeatMapMode } from '../../ui/uiSlice';

interface ModuleNodeProps {
    pythonModule: PythonModule;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

export const ModuleNode: React.FC<ModuleNodeProps> = function ({ pythonModule, filter, usages }) {
    const hasClasses = !isEmptyList(pythonModule.classes);
    const hasFunctions = !isEmptyList(pythonModule.functions);
    const hasChildren = hasClasses || hasFunctions;

    const heatMapMode = useAppSelector(selectHeatMapMode);
    let valuePair: ValuePair = new ValuePair(undefined, undefined);
    if (heatMapMode === HeatMapMode.Usages || heatMapMode === HeatMapMode.Usefulness) {
        valuePair = getMapWithUsages(usages, pythonModule);
    }

    return (
        <TreeNode
            declaration={pythonModule}
            icon={FaArchive}
            isExpandable={hasChildren}
            filter={filter}
            usages={usages}
            maxValue={valuePair.maxValue}
            specificValue={valuePair.specificValue}
        />
    );
};

const getMapWithUsages = function (usages: UsageCountStore, pythonModule: PythonModule): ValuePair {
    const maxValue = usages.moduleMaxUsages;
    const specificValue = usages.moduleUsages.get(pythonModule.id) ?? 0;

    return new ValuePair(specificValue, maxValue);
};
