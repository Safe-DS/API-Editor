import React from "react";
import PythonFunction from "../../model/PythonFunction";
import classNames from "classnames";
import {isEmptyList} from "../../util/listOperations";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCogs} from "@fortawesome/free-solid-svg-icons";
import PythonDeclaration from "../../model/PythonDeclaration";

type FunctionNodeProps = {
    pythonFunction: PythonFunction,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>,
    isMethod?: boolean
}

export default function FunctionNode({pythonFunction,
                                      selection,
                                      setSelection,
                                      isMethod = false}: FunctionNodeProps): JSX.Element {

    const hasParameters = !isEmptyList(pythonFunction.parameters);
    const cssClasses = classNames(
        "tree-view-row", {
            "text-muted": !hasParameters,
            "pl-3-5rem": !isMethod,
            "pl-5rem": isMethod,
            "selected": (selection.path().join() === pythonFunction.path().join()) && hasParameters
        }
    );

    const handleClick = function() {
        setSelection(pythonFunction);
    };

    return (
        <div className="function-node">
            <div className={cssClasses}
                 onClick={handleClick}>
                <FontAwesomeIcon icon={faCogs}/>
                {" "}
                <span>
                    {pythonFunction.name}
                </span>
            </div>
        </div>
    );
}
