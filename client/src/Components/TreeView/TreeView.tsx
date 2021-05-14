import React from 'react'
import Tree from "../Tree/Tree";
import './tree-view.css';
import packageJson from "../../sklearn.json";
import PythonPackageBuilder from "../../model/PythonPackageBuilder";

const TreeView = () => {
    let importedPackage = PythonPackageBuilder.make(packageJson);
    return(
        <div className="treeViewDiv">
            <h2>{importedPackage.name}</h2>
            <Tree inputPackage={importedPackage}/>
        </div>
    )
}

export default TreeView;