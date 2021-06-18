import React from 'react'
import Tree from "../Tree/Tree";
import './tree-view.css';
import packageJson from "../../data/sklearn.json";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/PythonPackageBuilder";
import PythonFunction from "../../model/PythonFunction";

type TreeViewProps = {
    setParameters: any,
    selection: string[],
    setSelection: any,
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

const TreeView = ({setParameters, selection, setSelection, setSelectedFunction}: TreeViewProps) => {
    let pythonPackage = parsePythonPackageJson(packageJson as PythonPackageJson);
    return (
        <div className="tree-view">
            <h2 className="package-name">{pythonPackage.name}</h2>
            <Tree pythonPackage={pythonPackage}
                  setParameters={setParameters}
                  selection={selection}
                  setSelection={setSelection}
                  setSelectedFunction={setSelectedFunction}
            />
        </div>
    )
}

export default TreeView;