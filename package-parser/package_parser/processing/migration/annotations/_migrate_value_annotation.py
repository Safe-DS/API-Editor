from copy import deepcopy
from typing import Optional, Tuple, Union

from package_parser.processing.annotations.model import (
    AbstractAnnotation,
    ConstantAnnotation,
    EnumReviewResult,
    OmittedAnnotation,
    OptionalAnnotation,
    RequiredAnnotation,
    TodoAnnotation,
    ValueAnnotation,
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
                migrated_constant_annotation = migrate_constant_annotation(
                    value_annotation, parameter, mapping
                )
                if migrated_constant_annotation is not None:
                    return [migrated_constant_annotation]
            if isinstance(value_annotation, OmittedAnnotation):
                migrated_omitted_annotation = migrate_omitted_annotation(
                    value_annotation, parameter, mapping
                )
                if migrated_omitted_annotation is not None:
                    return [migrated_omitted_annotation]
            if isinstance(value_annotation, OptionalAnnotation):
                migrated_optional_annotation = migrate_optional_annotation(
                    value_annotation, parameter, mapping
                )
                if migrated_optional_annotation is not None:
                    return [migrated_optional_annotation]
            if isinstance(value_annotation, RequiredAnnotation):
                migrated_required_annotation = migrate_required_annotation(
                    value_annotation, parameter, mapping
                )
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
                    migrated_constant_annotation = migrate_constant_annotation(
                        value_annotation, parameter, mapping
                    )
                    if migrated_constant_annotation is not None:
                        migrated_annotations.append(migrated_constant_annotation)
                        continue
                if isinstance(value_annotation, OmittedAnnotation):
                    migrated_omitted_annotation = migrate_omitted_annotation(
                        value_annotation, parameter, mapping
                    )
                    if migrated_omitted_annotation is not None:
                        migrated_annotations.append(migrated_omitted_annotation)
                        continue
                if isinstance(value_annotation, OptionalAnnotation):
                    migrated_optional_annotation = migrate_optional_annotation(
                        value_annotation, parameter, mapping
                    )
                    if migrated_optional_annotation is not None:
                        migrated_annotations.append(migrated_optional_annotation)
                        continue
                if isinstance(value_annotation, RequiredAnnotation):
                    migrated_required_annotation = migrate_required_annotation(
                        value_annotation, parameter, mapping
                    )
                    if migrated_required_annotation is not None:
                        migrated_annotations.append(migrated_required_annotation)
                        continue
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
        "The @Value Annotation with the variant '" + value_annotation.variant.value
    )
    if isinstance(value_annotation, (ConstantAnnotation, OptionalAnnotation)):
        migrate_text += (
            "' and the default Value '"
            + value_annotation.defaultValue
            + " ( type: "
            + value_annotation.defaultValueType.value
            + " )"
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


def _contains_type(
    default_value_type: ValueAnnotation.DefaultValueType, type_: Optional[AbstractType]
) -> bool:
    if type_ is None:
        return False
    if isinstance(type_, NamedType):
        return (
            (
                default_value_type is ValueAnnotation.DefaultValueType.BOOLEAN
                and type_.name in ("bool", "boolean")
            )
            or (
                default_value_type is ValueAnnotation.DefaultValueType.STRING
                and type_.name in ("str", "string")
            )
            or (
                default_value_type is ValueAnnotation.DefaultValueType.NUMBER
                and (
                    type_.name in ("int", "integer", "float")
                    or type_.name.startswith("int ")
                    or type_.name.startswith("float ")
                )
            )
        )
    if isinstance(type_, UnionType):
        for element in type_.types:
            if _contains_type(default_value_type, element):
                return True
    return False


def _have_same_default_type_and_value(
    annotation: Union[OmittedAnnotation, RequiredAnnotation],
    parameterv2: Parameter,
    mapping: Mapping,
) -> Optional[Tuple[bool, bool]]:
    element_list = [
        element
        for element in mapping.get_apiv1_elements()
        if isinstance(element, Parameter) and element.id == annotation.target
    ]
    if len(element_list) != 1:
        return None
    parameterv1 = element_list[0]
    parameterv1_default_value = parameterv1.default_value
    parameterv2_default_value = parameterv2.default_value

    if parameterv1_default_value is None:
        return None
    if parameterv2_default_value is None:
        return None
    have_same_explicit_value_type = False
    are_equal = False
    if parameterv1_default_value == "None" and parameterv2_default_value == "None":
        are_equal, have_same_explicit_value_type = True, True
    elif (
        _contains_type(ValueAnnotation.DefaultValueType.NUMBER, parameterv1.type)
        or _contains_type(ValueAnnotation.DefaultValueType.NUMBER, parameterv2.type)
    ):
        try:
            intv1_value = int(parameterv1_default_value)
            intv2_value = int(parameterv2_default_value)
            are_equal = intv1_value == intv2_value
            have_same_explicit_value_type = True
        except ValueError:
            try:
                floatv1_value = float(parameterv1_default_value)
                floatv2_value = float(parameterv2_default_value)
                are_equal = floatv1_value == floatv2_value
                have_same_explicit_value_type = True
                try:
                    int(parameterv1_default_value)
                    have_same_explicit_value_type = False
                    are_equal = False
                except ValueError:
                    try:
                        int(parameterv2_default_value)
                        have_same_explicit_value_type = False
                        are_equal = False
                    except ValueError:
                        pass
            except ValueError:
                pass
    elif (
        parameterv1_default_value in ("True", "False")
        and parameterv2_default_value in ("True", "False")
    ):
        have_same_explicit_value_type = True
        are_equal = bool(parameterv1_default_value) == bool(parameterv2_default_value)
    elif (
        (parameterv1_default_value.startswith("'") and parameterv1_default_value.endswith("'")) or (parameterv1_default_value.startswith("\"") or parameterv1_default_value.endswith("\""))
        and
        (parameterv2_default_value.startswith("'") and parameterv2_default_value.endswith("'")) or (parameterv2_default_value.startswith("\"") or parameterv2_default_value.endswith("\""))
    ):
        have_same_explicit_value_type = True
        are_equal = parameterv1_default_value[1:-1] == parameterv2_default_value[1:-1]
    return have_same_explicit_value_type, are_equal


def migrate_constant_annotation(
    constant_annotation: ConstantAnnotation, parameter: Parameter, mapping: Mapping
) -> Optional[ConstantAnnotation]:
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
            migrate_text
            if len(constant_annotation.comment) == 0
            else constant_annotation.comment + "\n" + migrate_text,
            EnumReviewResult.UNSURE,
            constant_annotation.defaultValueType,
            constant_annotation.defaultValue,
        )
    return None


def migrate_omitted_annotation(
    omitted_annotation: OmittedAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[OmittedAnnotation]:
    same_type_and_value = _have_same_default_type_and_value(omitted_annotation, parameterv2, mapping)
    if same_type_and_value is None:
        return None
    explicit_same_type, are_equal = same_type_and_value
    is_unsure = explicit_same_type and are_equal
    review_result = EnumReviewResult.NONE if is_unsure else EnumReviewResult.UNSURE
    migrate_text = (
        _get_migration_text(mapping, omitted_annotation)
        if len(omitted_annotation.comment) == 0
        else omitted_annotation.comment
        + "\n"
        + _get_migration_text(mapping, omitted_annotation)
    )

    if explicit_same_type:
        return OmittedAnnotation(
            parameterv2.id,
            omitted_annotation.authors,
            omitted_annotation.reviewers,
            omitted_annotation.comment if is_unsure else migrate_text,
            review_result,
        )
    return None


def migrate_optional_annotation(
    optional_annotation: OptionalAnnotation, parameter: Parameter, mapping: Mapping
) -> Optional[OptionalAnnotation]:
    if _contains_type(optional_annotation.defaultValueType, parameter.type):
        return OptionalAnnotation(
            parameter.id,
            optional_annotation.authors,
            optional_annotation.reviewers,
            optional_annotation.comment,
            EnumReviewResult.NONE,
            optional_annotation.defaultValueType,
            optional_annotation.defaultValue,
        )
    if parameter.type is None:
        optional_annotation.target = parameter.id
        optional_annotation.reviewResult = EnumReviewResult.UNSURE
        migrate_text = _get_migration_text(mapping, optional_annotation)
        return OptionalAnnotation(
            parameter.id,
            optional_annotation.authors,
            optional_annotation.reviewers,
            migrate_text
            if len(optional_annotation.comment) == 0
            else optional_annotation.comment + "\n" + migrate_text,
            EnumReviewResult.UNSURE,
            optional_annotation.defaultValueType,
            optional_annotation.defaultValue,
        )
    return None


def migrate_required_annotation(
    required_annotation: RequiredAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[RequiredAnnotation]:
    same_type_and_value = _have_same_default_type_and_value(required_annotation, parameterv2, mapping)
    if same_type_and_value is None:
        return None
    same_type, _ = same_type_and_value
    review_result = (
        EnumReviewResult.NONE if same_type else EnumReviewResult.UNSURE
    )

    if same_type:
        return RequiredAnnotation(
            parameterv2.id,
            required_annotation.authors,
            required_annotation.reviewers,
            required_annotation.comment,
            review_result,
        )
    return None
