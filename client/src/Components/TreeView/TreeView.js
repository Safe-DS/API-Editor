import React from 'react'
import Tree from "../Tree/Tree";
import packageJson from "../../sklearn.json";
import PythonPackageBuilder from "../../model/PythonPackageBuilder";

const TreeView = () => {
    let importedPackage = PythonPackageBuilder.make(packageJson);
    return(
        <div className="treeViewDiv">
            <h2>{importedPackage.name}</h2>
            <div>
                <Tree inputPackage={importedPackage}/>
            </div>
        </div>
    )
}

export default TreeView;