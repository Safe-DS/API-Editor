import PythonImport from "./PythonImport";

test("toString without alias", () => {
    const pythonImport = new PythonImport("module")
    expect(pythonImport.toString()).toBe("import module")
})

test("toString with alias", () => {
    const pythonImport = new PythonImport("module", "m")
    expect(pythonImport.toString()).toBe("import module as m")
})

export {}