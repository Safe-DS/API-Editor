import PythonPackage from "./PythonPackage";

test("path", () => {
    const pythonPackage = new PythonPackage("package")
    expect(pythonPackage.path()).toEqual(["package"])
})

test("toString", () => {
    const pythonPackage = new PythonPackage("package")
    expect(pythonPackage.toString()).toBe(`Package "package"`)
})

export {}