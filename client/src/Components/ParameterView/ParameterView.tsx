import React from "react";
import PythonDeclaration from "../../model/PythonDeclaration";
import PythonFunction from "../../model/PythonFunction";
import {isEmptyList} from "../../util/listOperations";
import DocumentationText from "./DocumentationText";
import ParameterNode from "./ParameterNode";

interface ParameterViewProps {
    selection: PythonDeclaration
}

export default function ParameterView({selection}: ParameterViewProps): JSX.Element {
    return (
        <div className="parameter-view">
            {selection instanceof PythonFunction &&
            <>
                <h1>{selection.name}</h1>
                <DocumentationText inputText={selection.description}/>
                <h2 className={"parameter-title"}>Parameters</h2>
                {
                    !isEmptyList(selection.parameters) ?
                        selection.parameters.map(function (parameters) {
                            return (<ParameterNode key={parameters.name} inputParameter={parameters}/>);
                        }) :
                        <span className="text-muted" style={{paddingLeft: '1rem'}}>There are no parameters.</span>
                }
            </>
            }
        </div>
    );
}
