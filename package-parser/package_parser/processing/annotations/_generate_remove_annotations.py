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
        if usages.n_class_usages(class_.id) == 0:
            annotations.removes.append(
                RemoveAnnotation(
                    target=class_.id, authors=[autogen_author], reviewers=[]
                )
            )

    for function in api.functions.values():
        if usages.n_function_usages(function.id) == 0:
            annotations.removes.append(
                RemoveAnnotation(
                    target=function.id, authors=[autogen_author], reviewers=[]
                )
            )
