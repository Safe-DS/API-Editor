import { Annotation } from '../annotations/annotationSlice';
import { jsonCode } from '../../common/util/stringOperations';

const baseURL = 'https://github.com/lars-reimann/api-editor';

// Documentation

const documentationBaseURL = `${baseURL}/blob/main/docs`;

export const userGuideURL = `${documentationBaseURL}/api-editor.md`;

// Issues

const issueBaseURL = `${baseURL}/issues/new`;

export const bugReportURL = `${issueBaseURL}?assignees=&labels=bug&template=bug_report.yml`;
export const featureRequestURL = `${issueBaseURL}?assignees=&labels=enhancement&template=feature_request.yml`;

const baseMissingAnnotationURL = `${issueBaseURL}?assignees=&labels=bug%2Cmissing+annotation&template=missing_annotation.yml`;

export const missingAnnotationURL = function (target: string): string {
    const urlHash = encodeURIComponent(`\`#/${target}\``);

    return baseMissingAnnotationURL + `&url-hash=${urlHash}`;
};

const baseWrongAnnotationURL = `${issueBaseURL}?assignees=&template=wrong_annotation.yml&labels=bug%2Cwrong+annotation%2C`;

export const wrongAnnotationURL = function (annotationType: string, annotation: Annotation): string {
    const minimalAnnotation = {
        ...annotation,
        authors: ['$autogen$'],
    };
    // noinspection JSConstantReassignment
    delete minimalAnnotation.reviewers;

    const label = encodeURIComponent(`@${annotationType}`);
    const urlHash = encodeURIComponent(`\`#/${annotation.target}\``);
    const actualAnnotationType = encodeURIComponent(`\`@${annotationType}\``);
    const actualAnnotationInputs = encodeURIComponent(jsonCode(JSON.stringify(minimalAnnotation, null, 4)));

    return (
        `${baseWrongAnnotationURL}${label}` +
        `&url-hash=${urlHash}` +
        `&actual-annotation-type=${actualAnnotationType}` +
        `&actual-annotation-inputs=${actualAnnotationInputs}`
    );
};
