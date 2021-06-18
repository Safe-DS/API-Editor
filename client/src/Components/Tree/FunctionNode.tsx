import React from "react";
import PythonFunction from "../../model/PythonFunction";
import classNames from "classnames";
import {isEmptyList} from "../../Utility/listOperations";

type FunctionNodeProps = {
    pythonFunction: PythonFunction,
    selection: string[],
    setSelection: (newValue: string[]) => void,
    setParameters: any,
    isMethod?: boolean,

    /** A parent of a Python class can be a class or a Python module. */
    parentPath: string[],
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

const FunctionNode = ({
                          pythonFunction,
                          selection,
                          setSelection,
                          setParameters,
                          parentPath,
                          isMethod = false,
                          setSelectedFunction
                      }: FunctionNodeProps) => {

    const path = parentPath.concat(pythonFunction.name)
    const hasParameters = isEmptyList(pythonFunction.parameters);
    const cssClasses = classNames(
        "tree-view-row", {
            "text-muted": !hasParameters,
            "cursor-na": !hasParameters,
            "pl-3-5rem": !isMethod,
            "pl-5rem": isMethod,
            "selected": (selection.join() === path.join()) && hasParameters
        }
    );

    return (
        <div className="function-node">
            <div className={cssClasses}
                 onClick={() => {
                     setSelection(path);
                     setParameters(pythonFunction.parameters);
                     setSelectedFunction(pythonFunction);
                 }}>
                <span className="indicator">
                    𝑓
                </span>
                {" "}
                <span>
                    {pythonFunction.name}
                </span>
            </div>
        </div>
    );
};

export default FunctionNode;