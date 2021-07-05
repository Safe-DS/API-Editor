import React, {useState} from 'react';
import pythonPackageJson from "../../data/sklearn.json";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/python/PythonPackageBuilder";
import Menu from "../Menu/Menu";
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";
import './App.css';

export default function App(): JSX.Element {
    const pythonPackage = parsePythonPackageJson(pythonPackageJson as PythonPackageJson);
    const [selection, setSelection] = useState<PythonDeclaration>(pythonPackage);

    return (
        <div className="App">
            <Menu selection={selection}/>
            <TreeView pythonPackage={pythonPackage}
                      selection={selection}
                      setSelection={setSelection}/>
            <ParameterView selection={selection}/>
        </div>
    );
}
