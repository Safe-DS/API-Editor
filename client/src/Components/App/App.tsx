import React, {useState} from 'react';
import pythonPackageJson from "../../data/sklearn.json";
import PythonDeclaration from "../../model/PythonDeclaration";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/PythonPackageBuilder";
import Menu from "../Menu/Menu";
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";
import AppCSS from './App.module.css';

export default function App(): JSX.Element {
    const pythonPackage = parsePythonPackageJson(pythonPackageJson as PythonPackageJson);
    const [selection, setSelection] = useState<PythonDeclaration>(pythonPackage);

    return (
        <div className={AppCSS.app}>
            <div className={AppCSS.menu}>
                <Menu selection={selection}/>
            </div>
            <div className={AppCSS.leftPane}>
                <TreeView pythonPackage={pythonPackage}
                          selection={selection}
                          setSelection={setSelection}/>
            </div>
            <div className={AppCSS.rightPane}>
                <ParameterView selection={selection}/>
            </div>
        </div>
    );
}
