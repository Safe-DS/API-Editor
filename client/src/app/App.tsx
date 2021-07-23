import React, { useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import NotificationList from '../features/notifications/NotificationList'
import AnnotationStore, { AnnotationJson } from '../model/annotation/AnnotationStore'
import { PythonFilter } from '../model/python/PythonFilter'
import PythonPackage from '../model/python/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../model/python/PythonPackageBuilder'
import Menu from '../Components/Menu/Menu'
import SelectionView from '../Components/SelectionView/SelectionView'
import TreeView from '../Components/TreeView/TreeView'
import AppCSS from './App.module.css'
import * as idb from 'idb-keyval'

export default function App(): JSX.Element {
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(new PythonPackage('empty'))

    useEffect(() => {
        const getPythonPackageFromIndexedDB = async () => {
            const storedPackage = (await idb.get('package')) as PythonPackageJson
            if (storedPackage) {
                setPythonPackage(parsePythonPackageJson(storedPackage))
            }
        }

        getPythonPackageFromIndexedDB()
    })

    const [annotationStore, setAnnotationStore] = useState<AnnotationStore>(new AnnotationStore())

    useEffect(() => {
        const getAnnotationsFromIndexedDB = async () => {
            const storedAnnotations = (await idb.get('annotations')) as AnnotationJson
            if (storedAnnotations) {
                setAnnotationStore(AnnotationStore.fromJson(storedAnnotations))
            }
        }

        getAnnotationsFromIndexedDB()
    }, [])

    useEffect(() => {
        const setAnnotationsInIndexedDB = async () => {
            await idb.set('annotations', annotationStore.toJson())
        }

        setAnnotationsInIndexedDB()
    }, [annotationStore])

    const [filter, setFilter] = useState('')
    const pythonFilter = PythonFilter.fromFilterBoxInput(filter)
    const filteredPythonPackage = pythonPackage.filter(pythonFilter)

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
                <NotificationList />
            </div>
        </HashRouter>
    )
}
