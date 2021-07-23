import React, { useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import AnnotationStore, { AnnotationJson } from '../model/annotation/AnnotationStore'
import { PythonFilter } from '../model/python/PythonFilter'
import PythonPackage from '../model/python/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../model/python/PythonPackageBuilder'
import Menu from '../Components/Menu/Menu'
import SelectionView from '../Components/SelectionView/SelectionView'
import TreeView from '../Components/TreeView/TreeView'
import AppCSS from './App.module.css'

export default function App(): JSX.Element {
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(() => {
        const storedPackage = localStorage.getItem('package')
        if (storedPackage) {
            return parsePythonPackageJson(JSON.parse(storedPackage) as PythonPackageJson)
        } else {
            return new PythonPackage('empty')
        }
    })

    const [annotationStore, setAnnotationStore] = useState<AnnotationStore>(() => {
        const storedAnnotations = localStorage.getItem('annotations')
        if (storedAnnotations) {
            return AnnotationStore.fromJson(JSON.parse(storedAnnotations) as AnnotationJson)
        } else {
            return new AnnotationStore()
        }
    })

    const [filter, setFilter] = useState('')
    const pythonFilter = PythonFilter.fromFilterBoxInput(filter)
    const filteredPythonPackage = pythonPackage.filter(pythonFilter)

    useEffect(() => {
        localStorage.setItem('annotations', annotationStore.toJson())
    }, [annotationStore])

    return (
        <HashRouter>
            <div className={AppCSS.app}>
                <div className={AppCSS.menu}>
                    <Menu
                        setPythonPackage={setPythonPackage}
                        annotationStore={annotationStore}
                        setAnnotationStore={setAnnotationStore}
                        filter={filter}
                        setFilter={setFilter}
                    />
                </div>
                <div className={AppCSS.leftPane}>
                    <TreeView pythonPackage={filteredPythonPackage} />
                </div>
                <div className={AppCSS.rightPane}>
                    <SelectionView
                        pythonPackage={pythonPackage}
                        annotationStore={annotationStore}
                        setAnnotationStore={setAnnotationStore}
                    />
                </div>
            </div>
        </HashRouter>
    )
}
