import React from 'react';
import {Setter} from "../../util/types";
import Tree from "../Tree/Tree";
import "./TreeView.module.css";
import PythonPackage from "../../model/PythonPackage";
import PythonDeclaration from "../../model/PythonDeclaration";
import TreeViewCSS from "./TreeView.module.css";

interface TreeViewProps {
    pythonPackage: PythonPackage,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
}

export default function TreeView(props: TreeViewProps): JSX.Element {
    return (
        <div className={TreeViewCSS.treeView}>
            <h2 className={TreeViewCSS.packageName}>{props.pythonPackage.name}</h2>
            <Tree pythonPackage={props.pythonPackage}
                  selection={props.selection}
                  setSelection={props.setSelection}/>
        </div>
    );
}
