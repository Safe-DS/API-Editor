import { Box, Spacer, VStack } from '@chakra-ui/react';
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
import { StatisticsView } from './StatisticsView';
import { useAppSelector } from '../../../app/hooks';
import { selectPythonPackage } from '../apiSlice';
import { selectFilter } from '../../ui/uiSlice';
import { selectUsages } from '../../usages/usageSlice';

export const SelectionView: React.FC = function () {
    const pythonPackage = useAppSelector(selectPythonPackage);
    const pythonFilter = useAppSelector(selectFilter);
    const usages = useAppSelector(selectUsages);
    const declaration = pythonPackage.getByRelativePath(useLocation().pathname.split('/').splice(2));

    if (!declaration) {
        return null;
    }

    return (
        <VStack h="100%">
            <Box w="100%" flexGrow={1} overflowY="auto">
                <Box padding={4}>
                    {declaration instanceof PythonFunction && <FunctionView pythonFunction={declaration} />}
                    {declaration instanceof PythonClass && <ClassView pythonClass={declaration} />}
                    {declaration instanceof PythonModule && <ModuleView pythonModule={declaration} />}
                    {declaration instanceof PythonParameter && <ParameterView pythonParameter={declaration} />}
                    <StatisticsView />
                </Box>
            </Box>

            <Spacer />

            <ActionBar
                declaration={declaration}
                pythonPackage={pythonPackage}
                pythonFilter={pythonFilter}
                usages={usages}
            />
        </VStack>
    );
};
