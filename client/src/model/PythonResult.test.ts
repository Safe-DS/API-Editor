import PythonResult from "./PythonResult";

test("toString", () => {
    const pythonResult = new PythonResult("res")
    expect(pythonResult.toString()).toBe(`Result "res"`)
})

export {}