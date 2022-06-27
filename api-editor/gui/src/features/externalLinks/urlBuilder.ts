import { Annotation } from '../annotations/annotationSlice';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { buildMinimalUsagesStoreJson } from '../usages/minimalUsageStoreBuilder';
import { PythonPackage } from '../packageData/model/PythonPackage';
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

export const missingAnnotationURL = function (
    target: string,
    pythonPackage: PythonPackage,
    usages: UsageCountStore,
): string {
    const declaration = pythonPackage.getDeclarationById(target);

    const urlHash = encodeURIComponent(`\`#/${target}\``);
    // const minimalAPIData = encodeURIComponent(jsonCode(buildMinimalAPIJson(declaration)));
    const minimalUsageStore = encodeURIComponent(jsonCode(buildMinimalUsagesStoreJson(usages, declaration)));

    return (
        baseMissingAnnotationURL +
        `&url-hash=${urlHash}` +
        // `&minimal-api-data=${minimalAPIData}` + // Not possible, too long URL
        `&minimal-usage-store=${minimalUsageStore}`
    );
};

const baseWrongAnnotationURL = `${issueBaseURL}?assignees=&template=wrong_annotation.yml&labels=bug%2Cwrong+annotation%2C`;

export const wrongAnnotationURL = function (
    annotationType: string,
    annotation: Annotation,
    pythonPackage: PythonPackage,
    usages: UsageCountStore,
): string {
    const minimalAnnotation = {
        ...annotation,
        authors: ['$autogen$'],
    };
    // noinspection JSConstantReassignment
    delete minimalAnnotation.reviewers;

    const declaration = pythonPackage.getDeclarationById(annotation.target);

    const label = encodeURIComponent(`@${annotationType}`);
    const urlHash = encodeURIComponent(`\`#/${annotation.target}\``);
    const actualAnnotationType = encodeURIComponent(`\`@${annotationType}\``);
    const actualAnnotationInputs = encodeURIComponent(jsonCode(JSON.stringify(minimalAnnotation, null, 4)));
    // const minimalAPIData = encodeURIComponent(jsonCode(buildMinimalAPIJson(declaration)));
    const minimalUsageStore = encodeURIComponent(jsonCode(buildMinimalUsagesStoreJson(usages, declaration)));

    return (
        `${baseWrongAnnotationURL}${label}` +
        `&url-hash=${urlHash}` +
        `&actual-annotation-type=${actualAnnotationType}` +
        `&actual-annotation-inputs=${actualAnnotationInputs}` +
        // `&minimal-api-data=${minimalAPIData}` + // Not possible, too long URL
        `&minimal-usage-store=${minimalUsageStore}`
    );
};
