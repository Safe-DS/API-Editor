import { truncate } from './stringOperations';

describe('truncate', () => {
    test('should return strings with at most max length unchanged', () => {
        expect(truncate('Lorem ipsum', 11)).toBe('Lorem ipsum');
    });

    test('should truncate strings longer than max length and append ...', () => {
        expect(truncate('Lorem ipsum', 10)).toBe('Lorem ips\u2026');
    });
});
