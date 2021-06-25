import ParameterNode from "./Parameter";
import React from "react";
import PythonParameter from "../../model/PythonParameter";
import PythonFunction from "../../model/PythonFunction";
import DocumentationText from "./DocumentationText";
import {Breadcrumb} from "react-bootstrap";
import AnnotationList from "./AnnotationList";

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
                <Breadcrumb>
                    {(!selection || selection.length === 0) && (
                        <Breadcrumb.Item active>Nothing selected.</Breadcrumb.Item>
                    )}
                    {selection.map((name, index) => (
                        <Breadcrumb.Item active key={index}>{name}</Breadcrumb.Item>
                    ))}
                </Breadcrumb>
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
