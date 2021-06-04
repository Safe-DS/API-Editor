import React from "react";
import PythonFunction from "../../model/PythonFunction";
import classNames from "classnames";

type FunctionNodeProps = {
    pythonFunction: PythonFunction,
    selection: string,
    setSelection: (newValue: string) => void,
    isMethod?: boolean,
    /** A parent of a Python class can be a class or a Python module. */
    parentFullQualifiedName: string
}

const FunctionNode = ({pythonFunction, selection, setSelection, parentFullQualifiedName, isMethod=false}:FunctionNodeProps) => {

    const fullQualifiedName = parentFullQualifiedName + "." + pythonFunction.name;

    const cssClasses = classNames(
        "tree-view-row",
        {
            "pl-3-5rem": !isMethod,
            "pl-5rem": isMethod,
            "selected": selection === fullQualifiedName,
        }
    );

    return (
        <div className="function-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(fullQualifiedName);
                     console.log(fullQualifiedName + " has been selected.");
                     console.log(pythonFunction.parameters);
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