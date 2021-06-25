import { nameValidation } from './validation';

test("valid name starting with lower case letter", () => {
    const testString = "hallo_welt";
    expect(nameValidation(testString)).toEqual(true);
});

test("valid_name starting with _", () => {
    const testString = "_hallo_welt";
    expect(nameValidation(testString)).toEqual(true);
});

test("valid name starting with upper case letter", () => {
    const testString = "Hallo_welt";
    expect(nameValidation(testString)).toEqual(true);
});

test("invalid name with %", () => {
    const testString = "Hallo%welt";
    expect(nameValidation(testString)).toEqual(false);
});

test("invalid name starting with number", () => {
    const testString = "9Hallo_Welt";
    expect(nameValidation(testString)).toEqual(false);
});
