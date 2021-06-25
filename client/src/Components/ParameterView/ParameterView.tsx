import ParameterNode from "./ParameterNode";
import React from "react";
import PythonFunction from "../../model/PythonFunction";
import DocumentationText from "./DocumentationText";
import {Breadcrumb} from "react-bootstrap";
import PythonDeclaration from "../../model/PythonDeclaration";

type ParameterViewProps = {
    selection: PythonDeclaration
};

export default function ParameterView({selection}: ParameterViewProps): JSX.Element {

    return (
        <div className="parameter-view">
            <div className="parameter-view-path">
                <Breadcrumb>
                    {(!selection || selection.path().length === 0) && (
                        <Breadcrumb.Item active>Nothing selected.</Breadcrumb.Item>
                    )}
                    {selection.path().map((name, index) => (
                        <Breadcrumb.Item active key={index}>{name}</Breadcrumb.Item>
                    ))}
                </Breadcrumb>
            </div>

            {selection instanceof PythonFunction &&
            <>
                <h1>{selection.name}</h1>
                <DocumentationText inputText={selection.description}/>
                <h2 className={"parameter-title"}>Parameters</h2>
                {
                    selection.parameters ?
                        selection.parameters.map(function (parameters) {
                            return (<ParameterNode key={parameters.name} inputParameter={parameters}/>);
                        }) :
                        <span>There are no Parameters.</span>
                }
            </>
            }
        </div>
    );
}
