import PythonPackage from "./PythonPackage";

test("toString", () => {
    const pythonPackage = new PythonPackage("package")
    expect(pythonPackage.toString()).toBe(`Package "package"`)
})

export {}