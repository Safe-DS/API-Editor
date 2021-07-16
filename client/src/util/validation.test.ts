import {isValidJsonFile, isValidPythonIdentifier} from './validation';

test("valid name starting with lower case letter", () => {
    const testString = "hallo_welt";
    expect(isValidPythonIdentifier(testString)).toEqual(true);
});

test("valid_name starting with _", () => {
    const testString = "_hallo_welt";
    expect(isValidPythonIdentifier(testString)).toEqual(true);
});

test("valid name starting with upper case letter", () => {
    const testString = "Hallo_welt";
    expect(isValidPythonIdentifier(testString)).toEqual(true);
});

test("invalid name with %", () => {
    const testString = "Hallo%welt";
    expect(isValidPythonIdentifier(testString)).toEqual(false);
});

test("invalid name starting with number", () => {
    const testString = "9Hallo_Welt";
    expect(isValidPythonIdentifier(testString)).toEqual(false);
});

test("invalid json file name", () => {
    const testString = "helloWorld.png";
    expect(isValidJsonFile(testString)).toEqual(false);
});

test("valid json file name", () => {
    const testString = "helloWorld.json";
    expect(isValidJsonFile(testString)).toEqual(true);
});
