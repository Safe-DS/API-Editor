import React from 'react';
import Tree from "../Tree/Tree";
import './tree-view.css';
import packageJson from "../../data/sklearn.json";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/PythonPackageBuilder";
import PythonFunction from "../../model/PythonFunction";
import PythonParameter from "../../model/PythonParameter";

type TreeViewProps = {
    setParameters: Setter<PythonParameter[]>,
    selection: string[],
    setSelection: Setter<string[]>,
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

export default function TreeView({
                                     setParameters,
                                     selection,
                                     setSelection,
                                     setSelectedFunction
                                 }: TreeViewProps): JSX.Element {
    const pythonPackage = parsePythonPackageJson(packageJson as PythonPackageJson);
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
    );
}
