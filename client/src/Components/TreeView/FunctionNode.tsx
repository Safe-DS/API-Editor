import { faCogs } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import PythonFunction from '../../model/python/PythonFunction'
import { isEmptyList } from '../../util/listOperations'
import ParameterNode from './ParameterNode'
import TreeNode from './TreeNode'

interface FunctionNodeProps {
    pythonFunction: PythonFunction
}

export default function FunctionNode(props: FunctionNodeProps): JSX.Element {
    const hasParameters = !isEmptyList(props.pythonFunction.parameters)

    return (
        <TreeNode declaration={props.pythonFunction} icon={faCogs} isExpandable={hasParameters} isWorthClicking={true}>
            {props.pythonFunction.parameters.map((parameter) => (
                <ParameterNode key={parameter.name} pythonParameter={parameter} />
            ))}
        </TreeNode>
    )
}
