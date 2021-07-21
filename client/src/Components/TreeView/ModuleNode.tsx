import { faArchive } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import PythonModule from '../../model/python/PythonModule'
import { isEmptyList } from '../../util/listOperations'
import ClassNode from './ClassNode'
import FunctionNode from './FunctionNode'
import TreeNode from './TreeNode'

interface ModuleNodeProps {
    pythonModule: PythonModule
}

export default function ModuleNode(props: ModuleNodeProps): JSX.Element {
    const hasClasses = !isEmptyList(props.pythonModule.classes)
    const hasFunctions = !isEmptyList(props.pythonModule.functions)
    const hasChildren = hasClasses || hasFunctions

    return (
        <TreeNode
            declaration={props.pythonModule}
            icon={faArchive}
            isExpandable={hasChildren}
            isWorthClicking={hasChildren}
        >
            {[...props.pythonModule.classes]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((moduleClass) => (
                    <ClassNode key={moduleClass.name} pythonClass={moduleClass} />
                ))}

            {[...props.pythonModule.functions]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((moduleFunction) => (
                    <FunctionNode key={moduleFunction.name} pythonFunction={moduleFunction} />
                ))}
        </TreeNode>
    )
}
