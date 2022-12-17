from copy import deepcopy
from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    GroupAnnotation,
    EnumReviewResult,
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

    parameter_mappings = _get_mappings_for_grouped_parameters(group_annotation, mappings)

    migrate_text = get_migration_text(group_annotation, mapping, additional_information=parameter_mappings)

    migrated_annotations: list[AbstractAnnotation] = []

    for functionv2 in mapping.get_apiv2_elements():
        if isinstance(functionv2, (Attribute, Result)):
            continue
        if not isinstance(functionv2, Function):
            migrated_annotations.append(TodoAnnotation(
                target=functionv2.id,
                authors=authors,
                reviewers=group_annotation.reviewers,
                comment=group_annotation.comment,
                reviewResult=group_annotation.reviewResult,
                newTodo=migrate_text,
            ))
        else:
            grouped_parameters: list[Parameter] = []
            name_modifier = ""

            for parameter_mapping in parameter_mappings:
                if parameter_mapping is None:
                    name_modifier += "0"
                    continue
                found = False
                for parameter in parameter_mapping.get_apiv2_elements():
                    if isinstance(parameter, Parameter) and parameter.id.startswith(functionv2.id + "/"):
                        grouped_parameters.append(parameter)
                        name_modifier += "1"
                        found = True
                if not found:
                    name_modifier += "0"

            group_name = group_annotation.groupName
            review_result = EnumReviewResult.NONE

            if len(grouped_parameters) == 0:
                migrated_annotations.append(TodoAnnotation(
                    target=functionv2.id,
                    authors=authors,
                    reviewers=group_annotation.reviewers,
                    comment=group_annotation.comment,
                    reviewResult=group_annotation.reviewResult,
                    newTodo=migrate_text,
                ))

            if len(grouped_parameters) != len(group_annotation.parameters):
                group_name += str(int(name_modifier, base=2))
                review_result = EnumReviewResult.UNSURE

            migrated_annotations.append(GroupAnnotation(
                target=functionv2.id,
                authors=authors,
                reviewers=group_annotation.reviewers,
                comment=group_annotation.comment,
                reviewResult=review_result,
                groupName=group_name,
                parameters=list(map(lambda parameter: parameter.name, grouped_parameters)),
            ))

    return migrated_annotations


def _get_mappings_for_grouped_parameters(group_annotation: GroupAnnotation, mappings: list[Mapping]) -> list[Optional[Mapping]]:
    parameter_ids = [group_annotation.target + "/" + parameter_name for parameter_name in group_annotation.parameters]

    matched_mappings: list[Optional[Mapping]] = []
    for parameter_id in parameter_ids:
        found = False
        for mapping in mappings:
            if found:
                break
            for parameter in mapping.get_apiv1_elements():
                if isinstance(parameter, Parameter):
                    if parameter.id == parameter_id:
                        matched_mappings.append(mapping)
                        found = True
                        break
        if not found:
            matched_mappings.append(None)
    return matched_mappings
