import React, {useState} from 'react';
import pythonPackageJson from "../../data/sklearn.json";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/python/PythonPackageBuilder";
import Menu from "../Menu/Menu";
import TreeView from "../TreeView/TreeView";
import AppCSS from './App.module.css';
import {HashRouter} from "react-router-dom";
import PythonPackage from "../../model/python/PythonPackage";
import SelectionView from "../SelectionView/SelectionView";

export default function App(): JSX.Element {
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(parsePythonPackageJson(pythonPackageJson as PythonPackageJson));
    const [annotationStore, setAnnotationStore] = useState(new AnnotationStore());

    return (
        <HashRouter>
            <div className={AppCSS.app}>
                <div className={AppCSS.menu}>
                    <Menu setPythonPackage={setPythonPackage} annotationStore={annotationStore}/>
                </div>
                <div className={AppCSS.leftPane}>
                    <TreeView pythonPackage={pythonPackage}/>
                </div>
                <div className={AppCSS.rightPane}>
                    <SelectionView pythonPackage={pythonPackage}
                                   annotationStore={annotationStore}
                                   setAnnotationStore={setAnnotationStore}/>
                </div>
            </div>
        </HashRouter>
    );
}
