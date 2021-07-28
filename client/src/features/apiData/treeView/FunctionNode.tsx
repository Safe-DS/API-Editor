import React from 'react'
import { FaCogs } from 'react-icons/fa'
import { isEmptyList } from '../../../common/util/listOperations'
import PythonFunction from '../model/PythonFunction'
import ParameterNode from './ParameterNode'
import TreeNode from './TreeNode'

interface FunctionNodeProps {
    pythonFunction: PythonFunction
}

export default function FunctionNode(props: FunctionNodeProps): JSX.Element {
    const hasParameters = !isEmptyList(props.pythonFunction.parameters)

    return (
        <TreeNode declaration={props.pythonFunction} icon={FaCogs} isExpandable={hasParameters}>
            {props.pythonFunction.parameters.map((parameter) => (
                <ParameterNode key={parameter.name} pythonParameter={parameter} />
            ))}
        </TreeNode>
    )
}
