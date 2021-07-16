import React, {useState} from 'react';
import pythonPackageJson from "../../data/sklearn.json";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/python/PythonPackageBuilder";
import Menu from "../Menu/Menu";
import ParameterView from "../ParameterView/ParameterView";
import TreeView from "../TreeView/TreeView";
import AppCSS from './App.module.css';
import {HashRouter} from "react-router-dom";

export default function App(): JSX.Element {
    const pythonPackage = parsePythonPackageJson(pythonPackageJson as PythonPackageJson);
    const [annotationStore, setAnnotationStore] = useState(new AnnotationStore());

    return (
        <HashRouter>
            <div className={AppCSS.app}>
                <div className={AppCSS.menu}>
                    <Menu/>
                </div>
                <div className={AppCSS.leftPane}>
                    <TreeView pythonPackage={pythonPackage}/>
                </div>
                <div className={AppCSS.rightPane}>
                    <ParameterView pythonPackage={pythonPackage}
                                   annotationStore={annotationStore}
                                   setAnnotationStore={setAnnotationStore}
                    />
                </div>
            </div>
        </HashRouter>
    );
}
