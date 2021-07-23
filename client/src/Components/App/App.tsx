import React, {useEffect, useState} from 'react';
import sklearnJson from "../../data/sklearn.json";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {PythonFilter} from "../../model/python/PythonFilter";
import PythonPackage from "../../model/python/PythonPackage";
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
    const [filter, setFilter] = useState("");
    const pythonFilter = PythonFilter.fromFilterBoxInput(filter);
    const filteredPythonPackage = pythonPackage.filter(pythonFilter);

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
                    <Menu setPythonPackage={updatePythonPackage}
                          annotationStore={annotationStore}
                          setAnnotationStore={setAnnotationStore}
                          filter={filter}
                          setFilter={setFilter}/>
                </div>
                <div className={AppCSS.leftPane}>
                    <TreeView pythonPackage={filteredPythonPackage}/>
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
