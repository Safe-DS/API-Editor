import { jsonCode } from '../../common/util/stringOperations';
import { Annotation } from '../annotations/versioning/AnnotationStoreV2';

const apiEditorBaseURL = 'https://github.com/Safe-DS/API-Editor';
const libraryAnalyzerBaseURL = 'https://github.com/Safe-DS/Library-Analyzer';

// Documentation

const documentationBaseURL = `https://api-editor.readthedocs.io/en/latest`;

export const userGuideURL = `${documentationBaseURL}/gui`;

// Issues

const apiEditorIssueBaseURL = `${apiEditorBaseURL}/issues/new`;
const libraryAnalyzerIssueBaseURL = `${libraryAnalyzerBaseURL}/issues/new`;

export const bugReportURL = `${apiEditorIssueBaseURL}?assignees=&labels=bug&template=bug_report.yml`;
export const featureRequestURL = `${apiEditorIssueBaseURL}?assignees=&labels=enhancement&template=feature_request.yml`;

const baseMissingAnnotationURL = `${libraryAnalyzerIssueBaseURL}?assignees=&labels=bug%2Cmissing+annotation&template=missing_annotation.yml`;

export const missingAnnotationURL = function (target: string): string {
    const urlHash = encodeURIComponent(`\`#/${target}\``);

    return baseMissingAnnotationURL + `&url-hash=${urlHash}`;
};

const baseWrongAnnotationURL = `${libraryAnalyzerIssueBaseURL}?assignees=&template=wrong_annotation.yml&labels=bug%2Cwrong+annotation%2C`;

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
