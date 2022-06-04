import { Box, Spacer, VStack } from '@chakra-ui/react';
import React from 'react';
import { useLocation } from 'react-router';
import PythonClass from '../model/PythonClass';
import PythonFunction from '../model/PythonFunction';
import PythonModule from '../model/PythonModule';
import PythonPackage from '../model/PythonPackage';
import PythonParameter from '../model/PythonParameter';
import ClassView from './ClassView';
import FunctionView from './FunctionView';
import ModuleView from './ModuleView';
import ParameterView from './ParameterView';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { ActionBar } from './ActionBar';

interface SelectionViewProps {
    pythonPackage: PythonPackage;
    pythonFilter: AbstractPythonFilter;
}

export const SelectionView: React.FC<SelectionViewProps> = function ({ pythonPackage, pythonFilter }) {
    const declaration = pythonPackage.getByRelativePath(useLocation().pathname.split('/').splice(2));

    if (!declaration) {
        return null;
    }

    return (
        <VStack h="100%">
            <Box w="100%" flexGrow={1} overflowY="scroll">
                <Box padding={4}>
                    {declaration instanceof PythonFunction && <FunctionView pythonFunction={declaration} />}
                    {declaration instanceof PythonClass && <ClassView pythonClass={declaration} />}
                    {declaration instanceof PythonModule && <ModuleView pythonModule={declaration} />}
                    {declaration instanceof PythonParameter && <ParameterView pythonParameter={declaration} />}
                </Box>
            </Box>

            <Spacer />

            <ActionBar declaration={declaration} pythonPackage={pythonPackage} pythonFilter={pythonFilter} />
        </VStack>
    );
};
