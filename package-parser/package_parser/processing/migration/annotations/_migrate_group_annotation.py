from copy import deepcopy
from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    GroupAnnotation,
    TodoAnnotation,
)
from package_parser.processing.api.model import Attribute, Function, Parameter, Result
from package_parser.processing.migration.model import Mapping

from ._constants import migration_author
from ._get_migration_text import get_migration_text


def migrate_group_annotation(
    annotation: GroupAnnotation, mapping: Mapping, mappings: list[Mapping]
) -> list[AbstractAnnotation]:
    group_annotation = deepcopy(annotation)
    authors = group_annotation.authors
    authors.append(migration_author)
    group_annotation.authors = authors

    migrated_annotations: list[AbstractAnnotation] = []

    for functionv2 in mapping.get_apiv2_elements():
        if isinstance(functionv2, (Attribute, Result)):
            continue
        if not isinstance(functionv2, Function):
            migrated_annotations.append(
                TodoAnnotation(
                    target=functionv2.id,
                    authors=authors,
                    reviewers=group_annotation.reviewers,
                    comment=group_annotation.comment,
                    reviewResult=group_annotation.reviewResult,
                    newTodo=get_migration_text(
                        group_annotation, mapping),
                )
            )
        else:
            parameter_replacements = _get_mappings_for_grouped_parameters(
                group_annotation, mappings, functionv2
            )
            migrate_text = get_migration_text(
                group_annotation, mapping, additional_information=parameter_replacements
            )
            grouped_parameters: list[Parameter] = []
            name_modifier = ""

            for parameter in parameter_replacements:
                if parameter is None:
                    name_modifier = "0" + name_modifier
                else:
                    grouped_parameters.append(parameter)
                    name_modifier = "1" + name_modifier

            group_name = group_annotation.groupName
            review_result = EnumReviewResult.NONE

            if len(grouped_parameters) == 0:
                migrated_annotations.append(
                    TodoAnnotation(
                        target=functionv2.id,
                        authors=authors,
                        reviewers=group_annotation.reviewers,
                        comment=group_annotation.comment,
                        reviewResult=group_annotation.reviewResult,
                        newTodo=migrate_text,
                    )
                )
                continue

            if len(grouped_parameters) != len(group_annotation.parameters):
                group_name += str(int(name_modifier, base=2))
                review_result = EnumReviewResult.UNSURE

            migrated_annotations.append(
                GroupAnnotation(
                    target=functionv2.id,
                    authors=authors,
                    reviewers=group_annotation.reviewers,
                    comment=group_annotation.comment,
                    reviewResult=review_result,
                    groupName=group_name,
                    parameters=[parameter.name for parameter in grouped_parameters],
                )
            )

    return migrated_annotations


def _get_mappings_for_grouped_parameters(
    group_annotation: GroupAnnotation, mappings: list[Mapping], functionv2: Function
) -> list[Optional[Parameter]]:
    parameter_ids = [
        group_annotation.target + "/" + parameter_name
        for parameter_name in group_annotation.parameters
    ]

    matched_parameters: list[Optional[Parameter]] = []
    for parameter_id in parameter_ids:
        found = False
        for mapping in mappings:
            for parameterv1 in mapping.get_apiv1_elements():
                if (
                    isinstance(parameterv1, Parameter)
                    and parameterv1.id == parameter_id
                ):
                    for parameterv2 in mapping.get_apiv2_elements():
                        if isinstance(
                            parameterv2, Parameter
                        ) and parameterv2.id.startswith(functionv2.id + "/"):
                            matched_parameters.append(parameterv2)
                            found = True
                            break
                    if not found:
                        matched_parameters.append(None)
                    break
            if found:
                break
    return matched_parameters
