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
            {/*<FixedSizeList itemSize={24} height={500} itemCount={1000} width="100%">*/}
            {props.pythonPackage.modules.map((module) => (
                <ModuleNode key={module.name} pythonModule={module} />
            ))}
            {/*</FixedSizeList>*/}
        </Box>
    )
}

// const a = memo()
