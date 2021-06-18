import PythonModule from "./PythonModule";
import PythonPackage from "./PythonPackage";

test("path without parent", () => {
    const pythonModule = new PythonModule("module")
    expect(pythonModule.path()).toEqual(["module"])
})

test("path with parent", () => {
    const pythonModule = new PythonModule("module")
    new PythonPackage(
        "package",
        [pythonModule]
    )

    expect(pythonModule.path()).toEqual(["package", "module"])
})

test("toString", () => {
    const pythonModule = new PythonModule("module")
    expect(pythonModule.toString()).toBe(`Module "module"`)
})

export {}