from package_parser.model.annotations import AnnotationStore, RemoveAnnotation
from package_parser.model.api import API
from package_parser.model.usages import UsageCountStore


def _generate_remove_annotations(
    api: API, usages: UsageCountStore, annotations: AnnotationStore
) -> None:
    """
    Collect all functions and classes that are never used.
    :param usages: UsageStore object
    :param api: API object for usages
    :param annotations: AnnotationStore object
    """
    for function in api.functions.values():
        if usages.n_function_usages(function.qname) == 0:
            annotations.removes.append(RemoveAnnotation(function.pname))

    for class_ in api.classes.values():
        if usages.n_class_usages(class_.qname) == 0:
            annotations.removes.append(RemoveAnnotation(class_.pname))
