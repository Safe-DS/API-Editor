import { Box } from '@chakra-ui/react';
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
import { useAppSelector } from '../../../app/hooks';
import { selectRawPythonPackage } from '../apiSlice';

export const SelectionView: React.FC = function () {
    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const declaration = rawPythonPackage.getDeclarationById(useLocation().pathname.split('/').splice(1).join('/'));

    if (!declaration) {
        return null;
    }

    return (
        <Box overflowY="auto" h="100%" w="100%" padding={4}>
            {declaration instanceof PythonFunction && <FunctionView pythonFunction={declaration} />}
            {declaration instanceof PythonClass && <ClassView pythonClass={declaration} />}
            {declaration instanceof PythonModule && <ModuleView pythonModule={declaration} />}
            {declaration instanceof PythonParameter && <ParameterView pythonParameter={declaration} />}
        </Box>
    );
};
