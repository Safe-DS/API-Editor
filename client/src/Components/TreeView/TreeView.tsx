import React from 'react';
import {Setter} from "../../util/types";
import Tree from "../Tree/Tree";
import "./TreeView.module.css";
import PythonPackage from "../../model/python/PythonPackage";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import TreeViewCSS from "./TreeView.module.css";

interface TreeViewProps {
    pythonPackage: PythonPackage,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
}

export default function TreeView(props: TreeViewProps): JSX.Element {
    return (
        <div className={TreeViewCSS.treeView}>
            <Tree pythonPackage={props.pythonPackage}
                  selection={props.selection}
                  setSelection={props.setSelection}/>
        </div>
    );
}
