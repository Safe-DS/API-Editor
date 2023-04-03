import { pluralize, truncate } from './stringOperations';
import {expect, it, describe} from 'vitest';

describe('truncate', () => {
    it('should return strings with at most max length unchanged', () => {
        expect(truncate('Lorem ipsum', 11)).toBe('Lorem ipsum');
    });

    it('should truncate strings longer than max length and append ...', () => {
        expect(truncate('Lorem ipsum', 10)).toBe('Lorem ips\u2026');
    });
});

describe('pluralize', () => {
    it('should return singular if count is count', () => {
        expect(pluralize(1, 'thing')).toBe('1 thing');
    });

    it('should return plural otherwise', () => {
        expect(pluralize(0, 'thing')).toBe('0 things');
        expect(pluralize(2, 'thing')).toBe('2 things');
    });
});
