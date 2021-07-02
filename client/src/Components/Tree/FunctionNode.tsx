import {faCogs} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import PythonDeclaration from "../../model/PythonDeclaration";
import PythonFunction from "../../model/PythonFunction";
import {isEmptyList} from "../../util/listOperations";
import {Setter} from "../../util/types";
import TreeNode from "./TreeNode";

interface FunctionNodeProps {
    pythonFunction: PythonFunction,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
}

export default function FunctionNode(props: FunctionNodeProps): JSX.Element {
    const hasParameters = !isEmptyList(props.pythonFunction.parameters);

    return (
        <TreeNode
            declaration={props.pythonFunction}
            icon={faCogs}
            isExpandable={false}
            isWorthClicking={hasParameters}
            selection={props.selection}
            setSelection={props.setSelection}
        />
    );
}
