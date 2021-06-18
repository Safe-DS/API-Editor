import PythonParameter from "./PythonParameter";
import PythonFunction from "./PythonFunction";
import PythonPackage from "./PythonPackage";
import PythonModule from "./PythonModule";
import PythonClass from "./PythonClass";

test("path without parent", () => {
    const pythonParameter = new PythonParameter("param")
    expect(pythonParameter.path()).toEqual(["param"])
})

test("path with ancestors", () => {
    const pythonParameter = new PythonParameter("param")
    new PythonPackage(
        "package",
        [
            new PythonModule(
                "module",
                [],
                [],
                [
                    new PythonClass(
                        "Class",
                        [],
                        [],
                        [
                            new PythonFunction(
                                "function",
                                [],
                                [pythonParameter]
                            )
                        ]
                    )
                ]
            )
        ]
    )

    expect(pythonParameter.path()).toEqual(["package", "module", "Class", "function", "param"])
})

test("toString", () => {
    const pythonParameter = new PythonParameter("param")
    expect(pythonParameter.toString()).toBe(`Parameter "param"`)
})

export {}