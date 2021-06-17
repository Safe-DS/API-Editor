import ParameterNode from "./ParameterNode";
import React from "react";
import PythonParameter from "../../model/PythonParameter";

type ParameterViewProps = {inputParameters: PythonParameter[]}

const ParameterView = ({inputParameters}: ParameterViewProps) => {

    const hasInputParameters = inputParameters.length > 0;
    // Kommentar hinzugefügt

    return (
        <div className="parameterViewDiv">
            <h2 className={"parameter-title"}>Parameters</h2>
            {
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

