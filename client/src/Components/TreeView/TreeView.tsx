import React from 'react'
import Tree from "../Tree/Tree";
import './tree-view.css';
import packageJson from "../../sklearn.json";
import PythonPackageBuilder from "../../model/PythonPackageBuilder";

const TreeView = () => {
    let pythonPackage = PythonPackageBuilder.make(packageJson);
    return(
        <div className="treeViewDiv">
            <h2 className="package-name">{pythonPackage.name}</h2>
            <Tree pythonPackage={pythonPackage}/>
        </div>
    )
}

export default TreeView;