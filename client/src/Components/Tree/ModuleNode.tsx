import {faArchive} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import PythonDeclaration from "../../model/PythonDeclaration";
import PythonModule from "../../model/PythonModule";
import {isEmptyList} from "../../util/listOperations";
import {Setter} from "../../util/types";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";
import TreeNode from "./TreeNode";

interface ModuleNodeProps {
    pythonModule: PythonModule
    selection: PythonDeclaration
    setSelection: Setter<PythonDeclaration>
}

export default function ModuleNode(props: ModuleNodeProps): JSX.Element {
    const hasClasses = !isEmptyList(props.pythonModule.classes);
    const hasFunctions = !isEmptyList(props.pythonModule.functions);
    const hasChildren = hasClasses || hasFunctions;

    return (
        <TreeNode
            declaration={props.pythonModule}
            icon={faArchive}
            isExpandable={hasChildren}
            isWorthClicking={hasChildren}
            selection={props.selection}
            setSelection={props.setSelection}
        >
            {props.pythonModule.classes.map(moduleClass =>
                <ClassNode key={moduleClass.name}
                           pythonClass={moduleClass}
                           selection={props.selection}
                           setSelection={props.setSelection}/>
            )}
            {props.pythonModule.functions.map(moduleFunction =>
                <FunctionNode key={moduleFunction.name}
                              pythonFunction={moduleFunction}
                              selection={props.selection}
                              setSelection={props.setSelection}/>
            )}
        </TreeNode>
    );
}
