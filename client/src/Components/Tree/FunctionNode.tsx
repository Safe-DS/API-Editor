import React from "react";
import PythonFunction from "../../model/PythonFunction";
import classNames from "classnames";
import {isEmptyList} from "../../util/listOperations";
import {faCogs} from "@fortawesome/free-solid-svg-icons";
import PythonDeclaration from "../../model/PythonDeclaration";
import TreeNode from "./TreeNode";

type FunctionNodeProps = {
    pythonFunction: PythonFunction,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>,
    isMethod?: boolean
}

export default function FunctionNode({
                                         pythonFunction,
                                         selection,
                                         setSelection,
                                         isMethod = false
                                     }: FunctionNodeProps): JSX.Element {

    const hasParameters = !isEmptyList(pythonFunction.parameters);
    const cssClasses = classNames(
        "tree-view-row", {
            "text-muted": !hasParameters,
            "pl-3-5rem": !isMethod,
            "pl-5rem": isMethod,
            "selected": (selection.path().join() === pythonFunction.path().join()) && hasParameters
        }
    );

    const handleClick = function () {
        setSelection(pythonFunction);
    };

    return (
        <TreeNode
            className={cssClasses}
            icon={faCogs}
            hasChildren={false}
            level={isMethod ? 2 : 1}
            name={pythonFunction.name}
            onClick={handleClick}
            showChildren={false}
        />
    );
}
