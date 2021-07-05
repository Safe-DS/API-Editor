import {faKeyboard} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import PythonParameter from "../../model/python/PythonParameter";
import {Setter} from "../../util/types";
import TreeNode from "./TreeNode";

interface ParameterNodeProps {
    pythonParameter: PythonParameter,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
}

export default function ParameterNode(props: ParameterNodeProps): JSX.Element {
    return (
        <TreeNode
            declaration={props.pythonParameter}
            icon={faKeyboard}
            isExpandable={false}
            isWorthClicking={false}
            selection={props.selection}
            setSelection={props.setSelection}
        />
    );
}
