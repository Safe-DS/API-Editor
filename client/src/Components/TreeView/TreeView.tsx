import { Box } from '@chakra-ui/react'
import React from 'react'
import PythonPackage from '../../model/python/PythonPackage'
import ModuleNode from './ModuleNode'

interface TreeViewProps {
    pythonPackage: PythonPackage
}

export default function TreeView(props: TreeViewProps): JSX.Element {
    return (
        <Box p="1rem 0 2rem" whiteSpace="nowrap">
            {props.pythonPackage.modules.map((module) => (
                <ModuleNode key={module.name} pythonModule={module} />
            ))}
        </Box>
    )
}
