import React, {useEffect, useState} from 'react';
import sklearnJson from "../../data/sklearn.json";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/python/PythonPackageBuilder";
import Menu from "../Menu/Menu";
import TreeView from "../TreeView/TreeView";
import AppCSS from './App.module.css';
import {HashRouter} from "react-router-dom";
import PythonPackage from "../../model/python/PythonPackage";
import SelectionView from "../SelectionView/SelectionView";

export default function App(): JSX.Element {
    const initialJSON = '{"renamings":{},"enums":{}}';
    const [pythonPackageJsonString, setPythonPackageJsonString] = useState<string>(localStorage.getItem("package") || JSON.stringify(sklearnJson));
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(parsePythonPackageJson(JSON.parse(pythonPackageJsonString) as PythonPackageJson));
    const [annotationStore, setAnnotationStore] = useState(AnnotationStore.fromJson(JSON.parse(localStorage.getItem("annotations") || initialJSON)));

    function updatePythonPackage(value: string) {
        setPythonPackageJsonString(value);
        setPythonPackage(parsePythonPackageJson(JSON.parse(pythonPackageJsonString) as PythonPackageJson));
    }

    useEffect(() => {
        localStorage.setItem("package", pythonPackageJsonString);
        localStorage.setItem("annotations", annotationStore.toJson());
    });

    return (
        <HashRouter>
            <div className={AppCSS.app}>
                <div className={AppCSS.menu}>
                    <Menu setPythonPackage={updatePythonPackage} annotationStore={annotationStore}
                          setAnnotationStore={setAnnotationStore}/>
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
