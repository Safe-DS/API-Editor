import React from 'react'
import PythonParameter from '../../model/python/PythonParameter'
import ParameterNode from './ParameterNode'
import TitleValueViewPair from './TitleValueViewPair'

interface ParameterViewProps {
    pythonParameter: PythonParameter
}

export default function ParameterView(props: ParameterViewProps): JSX.Element {
    return (
        <div>
            <ParameterNode isTitle={true} pythonParameter={props.pythonParameter} />
            {props.pythonParameter.hasDefault && (
                <TitleValueViewPair title="Default value" value={props.pythonParameter.defaultValue} />
            )}
            {props.pythonParameter.type && (
                <>
                    <h2>Type</h2>
                    <span className="pl-1rem">{props.pythonParameter.type}</span>
                </>
            )}
        </div>
    )
}
