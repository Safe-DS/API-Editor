import PythonClass from "./PythonClass";
import PythonPackage from "./PythonPackage";
import PythonModule from "./PythonModule";

test("path without parent", () => {
    const pythonClass = new PythonClass("Class");
    expect(pythonClass.path()).toEqual(["Class"]);
});

test("path with ancestors", () => {
    const pythonClass = new PythonClass("Class");
    new PythonPackage(
        "package",
        [
            new PythonModule(
                "module",
                [],
                [],
                [pythonClass]
            )
        ]
    );

    expect(pythonClass.path()).toEqual(["package", "module", "Class"]);
});

test("toString without decorators and superclasses", () => {
    const pythonClass = new PythonClass("Class");
    expect(pythonClass.toString()).toBe("class Class");
});

test("toString with decorators and superclasses", () => {
    const pythonClass = new PythonClass("Class", ["deco1", "deco2"], ["super1", "super2"]);
    expect(pythonClass.toString()).toBe("@deco1 @deco2 class Class(super1, super2)");
});

export {};
