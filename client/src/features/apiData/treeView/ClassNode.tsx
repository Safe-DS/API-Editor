import React from 'react'
import { FaChalkboard } from 'react-icons/fa'
import { isEmptyList } from '../../../common/util/listOperations'
import PythonClass from '../model/PythonClass'
import FunctionNode from './FunctionNode'
import TreeNode from './TreeNode'

interface ClassNodeProps {
    pythonClass: PythonClass
}

export default function ClassNode(props: ClassNodeProps): JSX.Element {
    const hasMethods = !isEmptyList(props.pythonClass.methods)

    return (
        <TreeNode declaration={props.pythonClass} icon={FaChalkboard} isExpandable={hasMethods}>
            {props.pythonClass.methods.map((method) => (
                <FunctionNode key={method.name} pythonFunction={method} />
            ))}
        </TreeNode>
    )
}
