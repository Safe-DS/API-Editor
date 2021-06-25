import React, {useState} from 'react';
import './App.css';
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";
import PythonDeclaration from "../../model/PythonDeclaration";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/PythonPackageBuilder";
import packageJson from "../../data/sklearn.json";

export default function App(): JSX.Element {

    const pythonPackage = parsePythonPackageJson(packageJson as PythonPackageJson);
    const [selection, setSelection] = useState<PythonDeclaration>(pythonPackage);

    return (
        <div className="App">
            <TreeView pythonPackage={pythonPackage}
                      selection={selection}
                      setSelection={setSelection}/>
            <ParameterView selection={selection}/>
        </div>
    );
}
