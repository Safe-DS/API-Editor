from copy import deepcopy
from typing import Optional

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    EnumReviewResult,
    TodoAnnotation, ValueAnnotation, ConstantAnnotation, OptionalAnnotation, OmittedAnnotation, RequiredAnnotation,
)
from package_parser.processing.api.model import (
    AbstractType,
    Attribute,
    NamedType,
    Parameter,
    Result,
    UnionType,
)
from package_parser.processing.migration.model import (
    ManyToManyMapping,
    ManyToOneMapping,
    Mapping,
    OneToManyMapping,
    OneToOneMapping,
)

from ._constants import migration_author


def migrate_value_annotation(
    value_annotation: ValueAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    value_annotation = deepcopy(value_annotation)
    authors = value_annotation.authors
    authors.append(migration_author)
    value_annotation.authors = authors

    if isinstance(mapping, (OneToOneMapping, ManyToOneMapping)):
        parameter = mapping.get_apiv2_elements()[0]
        if isinstance(parameter, (Attribute, Result)):
            return []
        if isinstance(parameter, Parameter):
            if isinstance(value_annotation, ConstantAnnotation):
                migrated_constant_annotation = migrate_constant_annotation(value_annotation, parameter, mapping)
                if migrated_constant_annotation is not None:
                    return [migrated_constant_annotation]
            if isinstance(value_annotation, OmittedAnnotation):
                migrated_omitted_annotation = migrate_omitted_annotation(value_annotation, parameter, mapping)
                if migrated_omitted_annotation is not None:
                    return [migrated_omitted_annotation]
            if isinstance(value_annotation, OptionalAnnotation):
                migrated_optional_annotation = migrate_optional_annotation(value_annotation, parameter, mapping)
                if migrated_optional_annotation is not None:
                    return [migrated_optional_annotation]
            if isinstance(value_annotation, RequiredAnnotation):
                migrated_required_annotation = migrate_required_annotation(value_annotation, parameter, mapping)
                if migrated_required_annotation is not None:
                    return [migrated_required_annotation]
        return [
            TodoAnnotation(
                parameter.id,
                authors,
                value_annotation.reviewers,
                value_annotation.comment,
                EnumReviewResult.NONE,
                _get_migration_text(mapping, value_annotation),
            )
        ]
    migrated_annotations: list[AbstractAnnotation] = []
    if isinstance(mapping, (OneToManyMapping, ManyToManyMapping)):
        for parameter in mapping.get_apiv2_elements():
            if isinstance(parameter, (Result, Attribute)):
                continue
            if isinstance(parameter, Parameter):
                if isinstance(value_annotation, ConstantAnnotation):
                    migrated_constant_annotation = migrate_constant_annotation(value_annotation, parameter, mapping)
                    if migrated_constant_annotation is not None:
                        migrated_annotations.append(migrated_constant_annotation)
                if isinstance(value_annotation, OmittedAnnotation):
                    migrated_omitted_annotation = migrate_omitted_annotation(value_annotation, parameter, mapping)
                    if migrated_omitted_annotation is not None:
                        migrated_annotations.append(migrated_omitted_annotation)
                if isinstance(value_annotation, OptionalAnnotation):
                    migrated_optional_annotation = migrate_optional_annotation(value_annotation, parameter, mapping)
                    if migrated_optional_annotation is not None:
                        migrated_annotations.append(migrated_optional_annotation)
                if isinstance(value_annotation, RequiredAnnotation):
                    migrated_required_annotation = migrate_required_annotation(value_annotation, parameter, mapping)
                    if migrated_required_annotation is not None:
                        migrated_annotations.append(migrated_required_annotation)
            if not isinstance(parameter, (Attribute, Result)):
                migrated_annotations.append(
                    TodoAnnotation(
                        parameter.id,
                        authors,
                        value_annotation.reviewers,
                        value_annotation.comment,
                        EnumReviewResult.UNSURE,
                        _get_migration_text(mapping, value_annotation),
                    )
                )
    return migrated_annotations


def _get_migration_text(mapping: Mapping, value_annotation: ValueAnnotation) -> str:
    migrate_text = (
        "The @Value Annotation with the variant '"
        + value_annotation.variant
    )
    if isinstance(value_annotation, (ConstantAnnotation, OptionalAnnotation)):
        migrate_text += (
            "' and the default Value '"
            + value_annotation.defaultValue
            + " ( type: " + value_annotation.defaultValueType.value + " )"
        )
    migrate_text += (
        "' from the previous version was at '"
        + value_annotation.target
        + "' and the possible alternatives in the new version of the api are: "
        + ", ".join(
        map(lambda api_element: api_element.name, mapping.get_apiv2_elements())
    )
    )
    return migrate_text


def _contains_type(default_value_type: ValueAnnotation.DefaultValueType, type_: Optional[AbstractType]) -> bool:
    if type_ is None:
        return False
    if isinstance(type_, NamedType):
        return (
            default_value_type is ValueAnnotation.DefaultValueType.BOOLEAN and (type_.name is "bool" or type_.name is "boolean")
            or default_value_type is ValueAnnotation.DefaultValueType.STRING and (type_.name is "str" or type_.name is "string")
            or default_value_type is ValueAnnotation.DefaultValueType.NUMBER and (
                type_.name is "int"
                or type_.name is "integer"
                or type_.name is "float"
                or type_.name.startswith("int ")
                or type_.name.startswith("float ")
            )
        )
    if isinstance(type_, UnionType):
        for element in type_.types:
            if _contains_type(default_value_type, element):
                return True
    return False


def migrate_constant_annotation(constant_annotation: ConstantAnnotation, parameter: Parameter, mapping: Mapping) -> Optional[ConstantAnnotation]:
    if _contains_type(constant_annotation.defaultValueType, parameter.type):
        return ConstantAnnotation(
            parameter.id,
            constant_annotation.authors,
            constant_annotation.reviewers,
            constant_annotation.comment,
            EnumReviewResult.NONE,
            constant_annotation.defaultValueType,
            constant_annotation.defaultValue,
        )
    if parameter.type is None:
        constant_annotation.target = parameter.id
        constant_annotation.reviewResult = EnumReviewResult.UNSURE
        migrate_text = _get_migration_text(mapping, constant_annotation)
        return ConstantAnnotation(
            parameter.id,
            constant_annotation.authors,
            constant_annotation.reviewers,
            migrate_text if len(constant_annotation.comment) == 0 else constant_annotation.comment + "\n" + migrate_text,
            EnumReviewResult.UNSURE,
            constant_annotation.defaultValueType,
            constant_annotation.defaultValue,
        )
    return None


def _get_all_named_types(type_: AbstractType) -> set[str]:
    named_types = {}
    if isinstance(type_, NamedType):
        return {type_.name}
    if isinstance(type_, UnionType):
        for element in type_.types:
            named_types = named_types.union(_get_all_named_types(element))
    return named_types


def migrate_omitted_annotation(omitted_annotation: OmittedAnnotation, parameterv2: Parameter, mapping: Mapping) -> Optional[OmittedAnnotation]:
    element_list = [element for element in mapping.get_apiv1_elements() if isinstance(element, Parameter) and element.id == omitted_annotation.target]
    if len(element_list) is not 1 and parameterv2.default_value is None or element_list[0].default_value is None:
        return None
    parameterv1 = element_list[0]
    parameterv1_default_value = parameterv1.default_value
    parameterv2_default_value = parameterv2.default_value
    have_same_value_type = parameterv1_default_value is parameterv2_default_value
    review_result = EnumReviewResult.NONE
    if not have_same_value_type:
        try:
            int(parameterv1_default_value)
            int(parameterv2_default_value)
            have_same_value_type = True
        except ValueError:
            pass
    if not have_same_value_type:
        try:
            float(parameterv1_default_value)
            float(parameterv2_default_value)
            have_same_value_type = True
            try:
                int(parameterv1_default_value)
                review_result = EnumReviewResult.UNSURE
            except ValueError:
                pass
            try:
                int(parameterv2_default_value)
                review_result = EnumReviewResult.UNSURE
            except ValueError:
                pass
        except ValueError:
            pass
    if not have_same_value_type:
        have_same_value_type = parameterv1_default_value in ("True", "False") and parameterv2_default_value in ("True", "False")
    if have_same_value_type:
        return OmittedAnnotation(
            parameterv2.id,
            omitted_annotation.authors,
            omitted_annotation.reviewers,
            omitted_annotation.comment,
            review_result,
        )
    return None
