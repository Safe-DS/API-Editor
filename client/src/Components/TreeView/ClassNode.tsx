import React from 'react'
import { FaChalkboard } from 'react-icons/fa'
import PythonClass from '../../model/python/PythonClass'
import { isEmptyList } from '../../util/listOperations'
import FunctionNode from './FunctionNode'
import TreeNode from './TreeNode'

interface ClassNodeProps {
    pythonClass: PythonClass
}

export default function ClassNode(props: ClassNodeProps): JSX.Element {
    const hasMethods = !isEmptyList(props.pythonClass.methods)

    return (
        <TreeNode
            declaration={props.pythonClass}
            icon={FaChalkboard}
            isExpandable={hasMethods}
            isWorthClicking={hasMethods}
        >
            {props.pythonClass.methods.map((method) => (
                <FunctionNode key={method.name} pythonFunction={method} />
            ))}
        </TreeNode>
    )
}
