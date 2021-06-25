import React from 'react';
import Tree from "../Tree/Tree";
import './tree-view.css';
import PythonPackage from "../../model/PythonPackage";
import PythonDeclaration from "../../model/PythonDeclaration";

type TreeViewProps = {
    pythonPackage: PythonPackage,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
}

export default function TreeView({pythonPackage, selection, setSelection}: TreeViewProps): JSX.Element {

    return (
        <div className="tree-view">
            <h2 className="package-name">{pythonPackage.name}</h2>
            <Tree pythonPackage={pythonPackage}
                  selection={selection}
                  setSelection={setSelection}/>
        </div>
    );
}
