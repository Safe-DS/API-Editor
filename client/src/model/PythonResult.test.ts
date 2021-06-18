import PythonResult from "./PythonResult";
import PythonPackage from "./PythonPackage";
import PythonModule from "./PythonModule";
import PythonClass from "./PythonClass";
import PythonFunction from "./PythonFunction";

test("path without parent", () => {
    const pythonResult = new PythonResult("res")
    expect(pythonResult.path()).toEqual(["res"])
})

test("path with ancestors", () => {
    const pythonResult = new PythonResult("res")
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
                                [],
                                [pythonResult]
                            )
                        ]
                    )
                ]
            )
        ]
    )

    expect(pythonResult.path()).toEqual(["package", "module", "Class", "function", "res"])
})

test("toString", () => {
    const pythonResult = new PythonResult("res")
    expect(pythonResult.toString()).toBe(`Result "res"`)
})

export {}