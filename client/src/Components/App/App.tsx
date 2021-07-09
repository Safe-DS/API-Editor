import React, {useState} from 'react';
import pythonPackageJson from "../../data/sklearn.json";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/python/PythonPackageBuilder";
import Menu from "../Menu/Menu";
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";
import AppCSS from './App.module.css';
import {BrowserRouter} from "react-router-dom";

export default function App(): JSX.Element {
    const pythonPackage = parsePythonPackageJson(pythonPackageJson as PythonPackageJson);
    const [selection, setSelection] = useState<PythonDeclaration>(pythonPackage);
    const [annotationStore, setAnnotationStore] = useState(new AnnotationStore());

    return (
        <BrowserRouter>
            <div className={AppCSS.app}>
                <div className={AppCSS.menu}>
                    <Menu selection={selection}/>
                </div>
                <div className={AppCSS.leftPane}>
                    <TreeView
                        pythonPackage={pythonPackage}
                        selection={selection}
                        setSelection={setSelection}
                    />
                </div>
                <div className={AppCSS.rightPane}>
                    <ParameterView
                        pythonPackage={pythonPackage}
                        annotationStore={annotationStore}
                        setAnnotationStore={setAnnotationStore}
                    />
                </div>
            </div>
        </BrowserRouter>
    );
}
