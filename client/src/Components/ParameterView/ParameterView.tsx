import ParameterNode from "./ParameterNode";
import React from "react";
import PythonParameter from "../../model/PythonParameter";

type ParameterViewProps = {inputParameters: PythonParameter[]}

const ParameterView = ({inputParameters}: ParameterViewProps) => {

    const hasInputParameters = inputParameters.length > 0;

    return (

        <div className="parameterViewDiv">
            <h2>Parameters</h2>
            {
                hasInputParameters &&
                inputParameters?.map(function (parameters) {
                    return (<ParameterNode key={parameters.name} inputParameter={parameters} />)
                })
            }
            {
                !hasInputParameters &&
                    <h5>No Parameters available</h5>
            }

        </div>
    )
};

export default ParameterView;

