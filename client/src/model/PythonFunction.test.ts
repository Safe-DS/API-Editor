import PythonFunction from "./PythonFunction";
import PythonParameter from "./PythonParameter";

test("toString without decorators and parameters", () => {
    const pythonFunction = new PythonFunction("function")
    expect(pythonFunction.toString()).toBe("def function()")
})

test("toString with decorators and parameters", () => {
    const pythonFunction = new PythonFunction(
        "function",
        ["deco1", "deco2"],
        [
            new PythonParameter("param1"),
            new PythonParameter("param2")
        ])
    expect(pythonFunction.toString()).toBe("@deco1 @deco2 def function(param1, param2)")
})

export {}