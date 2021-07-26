import { Box } from '@chakra-ui/react'
import React from 'react'
import { useLocation } from 'react-router'
import PythonClass from '../../model/python/PythonClass'
import PythonFunction from '../../model/python/PythonFunction'
import PythonModule from '../../model/python/PythonModule'
import PythonPackage from '../../model/python/PythonPackage'
import PythonParameter from '../../model/python/PythonParameter'
import ClassView from './ClassView'
import FunctionView from './FunctionView'
import ModuleView from './ModuleView'
import ParameterView from './ParameterView'

interface SelectionViewProps {
    pythonPackage: PythonPackage
}

export default function SelectionView(props: SelectionViewProps): JSX.Element {
    const declaration = props.pythonPackage.getByRelativePath(useLocation().pathname.split('/').splice(2))

    return (
        <Box padding={4}>
            {declaration instanceof PythonFunction && <FunctionView pythonFunction={declaration} />}
            {declaration instanceof PythonClass && <ClassView pythonClass={declaration} />}
            {declaration instanceof PythonModule && <ModuleView pythonModule={declaration} />}
            {declaration instanceof PythonParameter && <ParameterView pythonParameter={declaration} />}
        </Box>
    )
}
