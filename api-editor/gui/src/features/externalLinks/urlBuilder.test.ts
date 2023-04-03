import { bugReportURL, featureRequestURL, missingAnnotationURL, userGuideURL, wrongAnnotationURL } from './urlBuilder';
import fetch from 'node-fetch';
import {expect, test} from 'vitest';

test('user guide URL should be correct', async () => {
    const response = await fetch(userGuideURL);
    expect(response.status).toBe(200);
}, 30000);

test('bug report URL should be correct', async () => {
    const response = await fetch(bugReportURL);
    expect(response.status).toBe(200);
}, 30000);

test('feature request URL should be correct', async () => {
    const response = await fetch(featureRequestURL);
    expect(response.status).toBe(200);
}, 30000);

test('missing annotation URL should be correct', async () => {
    const response = await fetch(missingAnnotationURL('foo'));
    expect(response.status).toBe(200);
}, 30000);

test('wrong annotation URL should be correct', async () => {
    const response = await fetch(wrongAnnotationURL('required', { target: 'foo' }));
    expect(response.status).toBe(200);
}, 30000);
