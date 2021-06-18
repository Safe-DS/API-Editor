import ParameterNode from "./ParameterNode";
import React from "react";
import PythonParameter from "../../model/PythonParameter";
import PythonFunction from "../../model/PythonFunction";
import DocumentationText from "./DocumentationText";

type ParameterViewProps = {
    inputParameters: PythonParameter[],
    selection: string[],
    selectedFunction: Nullable<PythonFunction>
};

export default function ParameterView({inputParameters, selection, selectedFunction}: ParameterViewProps): JSX.Element {

    const hasInputParameters = inputParameters.length > 0;

    return (
        <div className="parameter-view">
            <div className="parameter-view-path">
                {selection.length > 0 ?
                    // eslint-disable-next-line
                    selection.map<React.ReactNode>(n => <a href="#">{n}</a>)
                        .reduce((p, c) => [p, (<span> / </span>), c]) :
                    ""}
            </div>
            {selectedFunction !== null &&
            <>
                <h1>{selectedFunction.name}</h1>
                <DocumentationText inputText={selectedFunction.description}/>
            </>
            }

            <h2 className={"parameter-title"}>Parameters</h2>
            {
                inputParameters?.map(function (parameters) {
                    return (<ParameterNode key={parameters.name} inputParameter={parameters}/>);
                })
            }
            {
                !hasInputParameters &&
                <span>There are no Parameters.</span>
            }

        </div>
    );
}
