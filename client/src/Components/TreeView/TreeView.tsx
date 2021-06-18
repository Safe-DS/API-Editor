import React from 'react'
import Tree from "../Tree/Tree";
import './tree-view.css';
import packageJson from "../../data/sklearn_new_schema.json";
import PythonPackageBuilder from "../../model/PythonPackageBuilder";

type TreeViewProps = {
    setParameters: any,
}
const TreeView = ({setParameters}:TreeViewProps) => {
    let pythonPackage = PythonPackageBuilder.make(packageJson);
    return(
        <div className="tree-view">
            <h2 className="package-name">{pythonPackage.name}</h2>
            <Tree pythonPackage={pythonPackage} setParameters={setParameters}/>
        </div>
    )
}

export default TreeView;