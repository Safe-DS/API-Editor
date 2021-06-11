import React from "react";
import PythonFunction from "../../model/PythonFunction";
import classNames from "classnames";
import {isEmptyList} from "../../Utility/listOperations";

type FunctionNodeProps = {
    pythonFunction: PythonFunction,
    selection: string,
    setSelection: (newValue: string) => void,
    setParameters: any,
    isMethod?: boolean,
    /** A parent of a Python class can be a class or a Python module. */
    parentFullQualifiedName: string,
}

const FunctionNode = ({pythonFunction, selection, setSelection, setParameters, parentFullQualifiedName, isMethod=false}:FunctionNodeProps) => {

    const fullQualifiedName = parentFullQualifiedName + "." + pythonFunction.name;

    const hasParameters = isEmptyList(pythonFunction.parameters);

    const cssClasses = classNames(
        "tree-view-row",
        {
            "text-muted": !hasParameters,
            "cursor-na": !hasParameters,
            "pl-3-5rem": !isMethod,
            "pl-5rem": isMethod,
            "selected": selection === fullQualifiedName && hasParameters,
        }
    );

    return (
        <div className="function-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(fullQualifiedName);
                     setParameters(pythonFunction.parameters)
                 }}>
                <span className="indicator">
                    𝑓
                </span>
                { " " }
                <span>
                    {pythonFunction.name}
                </span>
            </div>
        </div>
    );
};

export default FunctionNode;