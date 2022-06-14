import { Box, VStack } from '@chakra-ui/react';
import React from 'react';
import { useLocation } from 'react-router';
import { PythonClass } from '../model/PythonClass';
import { PythonFunction } from '../model/PythonFunction';
import { PythonModule } from '../model/PythonModule';
import { PythonParameter } from '../model/PythonParameter';
import { ClassView } from './ClassView';
import { FunctionView } from './FunctionView';
import { ModuleView } from './ModuleView';
import { ParameterView } from './ParameterView';
import { ActionBar } from './ActionBar';
import { useAppSelector } from '../../../app/hooks';
import { selectRawPythonPackage } from '../apiSlice';
import { StatisticsView } from './StatisticsView';
import { selectUsages } from '../../usages/usageSlice';

export const SelectionView: React.FC = function () {
    const pythonPackage = useAppSelector(selectRawPythonPackage);
    const usages = useAppSelector(selectUsages);
    const declaration = pythonPackage.getDeclarationById(useLocation().pathname.split('/').splice(1).join('/'));
    const location = useLocation().pathname;

    if (location === '/statisticsView') {
        return (
            <VStack h="100%">
                <Box w="100%" flexGrow={1} overflowY="scroll">
                    <Box padding={4}>
                        <StatisticsView pythonPackage={pythonPackage} usages={usages} />
                    </Box>
                </Box>
            </VStack>
        );
    }

    if (!declaration) {
        return null;
    }

    return (
        <VStack h="100%" spacing={0}>
            <Box flexGrow={1} overflowY="auto" width="100%">
                <Box padding={4}>
                    {declaration instanceof PythonFunction && <FunctionView pythonFunction={declaration} />}
                    {declaration instanceof PythonClass && <ClassView pythonClass={declaration} />}
                    {declaration instanceof PythonModule && <ModuleView pythonModule={declaration} />}
                    {declaration instanceof PythonParameter && <ParameterView pythonParameter={declaration} />}
                </Box>
            </Box>

            <ActionBar declaration={declaration} />
        </VStack>
    );
};
