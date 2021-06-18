import ParameterNode from "./ParameterNode";
import React from "react";
import PythonParameter from "../../model/PythonParameter";

type ParameterViewProps = {
    inputParameters: PythonParameter[],
    selection: string[],
    setSelection: any
};

const ParameterView = ({inputParameters, selection }: ParameterViewProps) => {

    const hasInputParameters = inputParameters.length > 0;
    console.log(selection);

    return (
        <div className="parameter-view">
            <div className="parameter-view-path" >
                { selection.length > 0 ?
                    // eslint-disable-next-line
                    selection.map<React.ReactNode>(n => <a href="#">{n}</a>)
                             .reduce((p, c) => [p, (<span> / </span>), c]) :
                    "" }
            </div>
            <h2 className={"parameter-title"}>Parameters</h2>
            {
                inputParameters?.map(function (parameters) {
                    return (<ParameterNode key={parameters.name} inputParameter={parameters} />)
                })
            }
            {
                !hasInputParameters &&
                    <span>There are no Parameters.</span>
            }

        </div>
    )
};

export default ParameterView;

