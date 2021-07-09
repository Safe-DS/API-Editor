import React from 'react';
import Tree from "../Tree/Tree";
import "./TreeView.module.css";
import PythonPackage from "../../model/python/PythonPackage";
import TreeViewCSS from "./TreeView.module.css";

interface TreeViewProps {
    pythonPackage: PythonPackage
}

export default function TreeView(props: TreeViewProps): JSX.Element {
    return (
        <div className={TreeViewCSS.treeView}>
            <Tree pythonPackage={props.pythonPackage}/>
        </div>
    );
}
