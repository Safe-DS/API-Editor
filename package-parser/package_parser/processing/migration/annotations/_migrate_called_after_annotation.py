from copy import deepcopy

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    CalledAfterAnnotation,
    EnumReviewResult,
    TodoAnnotation,
)
from package_parser.processing.api.model import Attribute, Function, Result
from package_parser.processing.migration.model import Mapping

from ._constants import migration_author
from ._get_migration_text import get_migration_text


def migrate_called_after_annotation(
    called_after_annotation: CalledAfterAnnotation,
    mapping: Mapping,
    mappings: list[Mapping],
) -> list[AbstractAnnotation]:
    called_after_annotation = deepcopy(called_after_annotation)
    authors = called_after_annotation.authors
    authors.append(migration_author)
    called_after_annotation.authors = authors

    migrated_annotations: list[AbstractAnnotation] = []
    for element in mapping.get_apiv2_elements():
        if not isinstance(element, Function):
            if not isinstance(element, (Attribute, Result)):
                migrated_annotations.append(
                    TodoAnnotation(
                        element.id,
                        authors,
                        called_after_annotation.reviewers,
                        called_after_annotation.comment,
                        EnumReviewResult.NONE,
                        get_migration_text(
                            called_after_annotation, mapping, for_todo_annotation=True
                        ),
                    )
                )
            continue

        called_before_functions = _get_function_called_before_replacements(
            called_after_annotation, mappings, element
        )
        if len(called_before_functions) == 0:
            migrated_annotations.append(
                CalledAfterAnnotation(
                    element.id,
                    authors,
                    called_after_annotation.reviewers,
                    get_migration_text(
                        called_after_annotation,
                        mapping,
                        additional_information=called_before_functions,
                    ),
                    EnumReviewResult.UNSURE,
                    called_after_annotation.calledAfterName,
                )
            )
        elif (
            len(called_before_functions) == 1 and called_before_functions[0] != element
        ):
            migrated_annotations.append(
                CalledAfterAnnotation(
                    element.id,
                    authors,
                    called_after_annotation.reviewers,
                    called_after_annotation.comment,
                    called_after_annotation.reviewResult,
                    called_before_functions[0].name,
                )
            )
        else:
            migrated_annotations.append(
                TodoAnnotation(
                    element.id,
                    authors,
                    called_after_annotation.reviewers,
                    called_after_annotation.comment,
                    EnumReviewResult.NONE,
                    get_migration_text(
                        called_after_annotation,
                        mapping,
                        for_todo_annotation=True,
                        additional_information=called_before_functions,
                    ),
                )
            )
    return migrated_annotations


def _get_function_called_before_replacements(
    called_after_annotation: CalledAfterAnnotation,
    mappings: list[Mapping],
    functionv2: Function,
) -> list[Function]:
    called_before_idv1 = (
        "/".join(called_after_annotation.target.split("/")[:-1])
        + "/"
        + called_after_annotation.calledAfterName
    )
    called_before_idv2_prefix = "/".join(functionv2.id.split("/")[:-1]) + "/"
    functions_in_same_class: list[Function] = []
    for mapping in mappings:
        found_mapped_function_in_same_class = False
        for element in mapping.get_apiv1_elements():
            if isinstance(element, Function) and called_before_idv1 == element.id:
                found_mapped_function_in_same_class = True
                break

        if found_mapped_function_in_same_class:
            for replacement in mapping.get_apiv2_elements():
                if isinstance(replacement, Function) and replacement.id.startswith(
                    called_before_idv2_prefix
                ):
                    functions_in_same_class.append(replacement)
            break
    return functions_in_same_class
