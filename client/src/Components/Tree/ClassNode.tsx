import {faChalkboard} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import PythonClass from "../../model/python/PythonClass";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import {isEmptyList} from "../../util/listOperations";
import {Setter} from "../../util/types";
import FunctionNode from "./FunctionNode";
import TreeNode from "./TreeNode";

interface ClassNodeProps {
    pythonClass: PythonClass,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
}

export default function ClassNode(props: ClassNodeProps): JSX.Element {
    const hasMethods = !isEmptyList(props.pythonClass.methods);

    return (
        <TreeNode
            declaration={props.pythonClass}
            icon={faChalkboard}
            isExpandable={hasMethods}
            isWorthClicking={hasMethods}
            selection={props.selection}
            setSelection={props.setSelection}
        >
            {props.pythonClass.methods.map(method =>
                <FunctionNode key={method.name}
                              pythonFunction={method}
                              selection={props.selection}
                              setSelection={props.setSelection}/>
            )}
        </TreeNode>
    );
}
