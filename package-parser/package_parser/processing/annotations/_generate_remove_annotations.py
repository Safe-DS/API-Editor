from package_parser.processing.annotations.model import (
    AnnotationStore,
    RemoveAnnotation,
)
from package_parser.processing.api.model import API
from package_parser.processing.usages.model import UsageCountStore

from ._constants import autogen_author


def _generate_remove_annotations(
    api: API, usages: UsageCountStore, annotations: AnnotationStore
) -> None:
    """
    Collect all functions and classes that are never used.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for class_ in api.classes.values():
        n_class_usages = usages.n_class_usages(class_.id)
        if n_class_usages == 0:
            annotations.removeAnnotations.append(
                RemoveAnnotation(
                    target=class_.id,
                    authors=[autogen_author],
                    reviewers=[],
                    comment=_create_explanation("class", n_class_usages),
                )
            )

    for function in api.functions.values():
        n_function_usages = usages.n_function_usages(function.id)
        if n_function_usages == 0:
            annotations.removeAnnotations.append(
                RemoveAnnotation(
                    target=function.id,
                    authors=[autogen_author],
                    reviewers=[],
                    comment=_create_explanation("function", n_function_usages),
                )
            )


def _create_explanation(declaration_type: str, n_usages: int) -> str:
    result = f"I removed this {declaration_type} because it has"

    if n_usages == 0:
        result += " no known usages."
    elif n_usages == 1:
        result += " only one known usage."
    else:
        result += f" only {n_usages} known usages."

    return result
