import PythonClass from "./PythonClass";

test("toString without decorators and superclasses", () => {
    const pythonClass = new PythonClass("Class")
    expect(pythonClass.toString()).toBe("class Class")
})

test("toString with decorators and superclasses", () => {
    const pythonClass = new PythonClass("Class", ["deco1", "deco2"], ["super1", "super2"])
    expect(pythonClass.toString()).toBe("@deco1 @deco2 class Class(super1, super2)")
})

export {}