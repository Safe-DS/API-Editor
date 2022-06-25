import { Annotation } from '../annotations/annotationSlice';

const baseURL = 'https://github.com/lars-reimann/api-editor/issues/new';

export const bugReportURL = `${baseURL}?assignees=&labels=bug&template=bug_report.yml`;
export const featureRequestURL = `${baseURL}?assignees=&labels=enhancement&template=feature_request.yml`;

const baseMissingAnnotationURL = `${baseURL}?assignees=&labels=bug%2Cmissing+annotation&template=missing_annotation.yml`;

export const missingAnnotationURL = function (target: string): string {
    const urlHash = encodeURIComponent(`\`#/${target}\``);
    return `${baseMissingAnnotationURL}&url-hash=${urlHash}`;
};

const baseWrongAnnotationURL = `${baseURL}?assignees=&template=wrong_annotation.yml&labels=bug%2Cwrong+annotation%2C`;

export const wrongAnnotationURL = function (annotationType: string, annotation: Annotation): string {
    const minimalAnnotation = { ...annotation };

    // noinspection JSConstantReassignment
    delete minimalAnnotation.authors;
    // noinspection JSConstantReassignment
    delete minimalAnnotation.reviewers;

    const label = encodeURIComponent(`@${annotationType}`);
    const urlHash = encodeURIComponent(`\`#/${annotation.target}\``);
    const actualAnnotationType = encodeURIComponent(`\`@${annotationType}\``);
    const actualAnnotationInputs = encodeURIComponent(
        `\`\`\`json5\n${JSON.stringify(minimalAnnotation, null, 4)}\n\`\`\``,
    );
    return `${baseWrongAnnotationURL}${label}&url-hash=${urlHash}&actual-annotation-type=${actualAnnotationType}&actual-annotation-inputs=${actualAnnotationInputs}`;
};
