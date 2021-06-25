import React from 'react';
import PythonDeclaration from "../../model/PythonDeclaration";
import PythonPackage from "../../model/PythonPackage";
import {Setter} from "../../util/types";
import ModuleNode from "./ModuleNode";
import TreeCSS from "./Tree.module.css";

interface TreeProps {
    pythonPackage: PythonPackage
    selection: PythonDeclaration
    setSelection: Setter<PythonDeclaration>
}

export default function Tree(props: TreeProps): JSX.Element {
    return (
        <div className={TreeCSS.tree}>
            {props.pythonPackage.modules.map(module => (
                <ModuleNode key={module.name}
                            pythonModule={module}
                            selection={props.selection}
                            setSelection={props.setSelection}/>
            ))}
        </div>
    );
}
