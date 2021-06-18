import React from 'react'
import Tree from "../Tree/Tree";
import './tree-view.css';
import packageJson from "../../sklearn.json";
import PythonPackageBuilder from "../../model/PythonPackageBuilder";

type TreeViewProps = {
    setParameters: any,
    selection: string[],
    setSelection: any
}

const TreeView = ({setParameters, selection, setSelection}: TreeViewProps) => {
    let pythonPackage = PythonPackageBuilder.make(packageJson);
    return(
        <div className="tree-view">
            <h2 className="package-name">{pythonPackage.name}</h2>
            <Tree pythonPackage = { pythonPackage }
                  setParameters = { setParameters }
                  selection = { selection }
                  setSelection = { setSelection }/>
        </div>
    )
}

export default TreeView;