from copy import deepcopy
from typing import Optional, Tuple, TypeVar

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
    Class,
    Function,
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
    annotation: ValueAnnotation, mapping: Mapping
) -> list[AbstractAnnotation]:
    value_annotation = deepcopy(annotation)
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


def _have_same_type(
    default_value_typev1: ValueAnnotation.DefaultValueType,
    parameterv1: Parameter,
    typev2: AbstractType,
) -> bool:
    if isinstance(typev2, NamedType):
        if default_value_typev1 is ValueAnnotation.DefaultValueType.NUMBER:
            if parameterv1 is not None:
                if typev2.name in ("int", "integer") or typev2.name.startswith("int "):
                    if parameterv1.type is None:
                        return False
                    types = [parameterv1.type]
                    if isinstance(parameterv1.type, UnionType):
                        types = parameterv1.type.types
                    for element in types:
                        if isinstance(element, NamedType) and (
                            element.name in ("int", "integer")
                            or element.name.startswith("int ")
                        ):
                            return True
                elif typev2.name == "float" or typev2.name.startswith("float "):
                    if parameterv1.type is None:
                        return False
                    types = [parameterv1.type]
                    if isinstance(parameterv1.type, UnionType):
                        types = parameterv1.type.types
                    for element in types:
                        if isinstance(element, NamedType) and (
                            element.name == "float" or element.name.startswith("float ")
                        ):
                            return True
                return False
        return (
            (
                default_value_typev1 is ValueAnnotation.DefaultValueType.BOOLEAN
                and typev2.name in ("bool", "boolean")
            )
            or (
                default_value_typev1 is ValueAnnotation.DefaultValueType.STRING
                and typev2.name in ("str", "string")
            )
            or (
                default_value_typev1 is ValueAnnotation.DefaultValueType.NUMBER
                and (
                    typev2.name in ("int", "integer", "float")
                    or typev2.name.startswith("int ")
                    or typev2.name.startswith("float ")
                )
            )
        )
    if isinstance(typev2, UnionType):
        for element in typev2.types:
            if _have_same_type(default_value_typev1, parameterv1, element):
                return True
    return False


def _have_same_value(
    parameterv1: Parameter,
    parameterv2: Parameter,
) -> Optional[Tuple[Optional[ValueAnnotation.DefaultValueType], bool]]:
    parameterv1_default_value = parameterv1.default_value
    parameterv2_default_value = parameterv2.default_value

    if parameterv1_default_value is None:
        return None
    if parameterv2_default_value is None:
        return None
    parameterv1_is_in_quotation_marks = (
        parameterv1_default_value.startswith("'")
        and parameterv1_default_value.endswith("'")
    ) or (
        parameterv1_default_value.startswith('"')
        and parameterv1_default_value.endswith('"')
    )
    parameterv2_is_in_quotation_marks = (
        parameterv2_default_value.startswith("'")
        and parameterv2_default_value.endswith("'")
    ) or (
        parameterv2_default_value.startswith('"')
        and parameterv2_default_value.endswith('"')
    )
    if parameterv1_default_value == "None" and parameterv2_default_value == "None":
        return None, True
    if parameterv2.type is None or _have_same_type(
        ValueAnnotation.DefaultValueType.NUMBER, parameterv1, parameterv2.type
    ):
        try:
            intv1_value = int(parameterv1_default_value)
            intv2_value = int(parameterv2_default_value)
            return ValueAnnotation.DefaultValueType.NUMBER, intv1_value == intv2_value
        except ValueError:
            try:
                floatv1_value = float(parameterv1_default_value)
                floatv2_value = float(parameterv2_default_value)
                return (
                    ValueAnnotation.DefaultValueType.NUMBER,
                    floatv1_value == floatv2_value,
                )
            except ValueError:
                try:
                    int(parameterv1_default_value)
                    float(parameterv2_default_value)
                    return ValueAnnotation.DefaultValueType.NUMBER, False
                except ValueError:
                    try:
                        int(parameterv2_default_value)
                        float(parameterv1_default_value)
                        return ValueAnnotation.DefaultValueType.NUMBER, False
                    except ValueError:
                        pass
    if parameterv1_default_value in (
        "True",
        "False",
    ) and parameterv2_default_value in ("True", "False"):
        return ValueAnnotation.DefaultValueType.BOOLEAN, bool(
            parameterv1_default_value
        ) == bool(parameterv2_default_value)
    if parameterv1_is_in_quotation_marks and parameterv2_is_in_quotation_marks:
        return (
            ValueAnnotation.DefaultValueType.STRING,
            parameterv1_default_value[1:-1] == parameterv2_default_value[1:-1],
        )
    return None


API_ELEMENTS = TypeVar("API_ELEMENTS", Class, Function, Parameter)


def get_api_element_from_mapping(
    annotation: AbstractAnnotation, mapping: Mapping, api_type: type[API_ELEMENTS]
) -> Optional[API_ELEMENTS]:
    element_list = [
        element
        for element in mapping.get_apiv1_elements()
        if (
            isinstance(element, api_type)
            and hasattr(element, "id")
            and element.id == annotation.target
        )
    ]
    if len(element_list) != 1:
        return None
    return element_list[0]


def migrate_constant_annotation(
    constant_annotation: ConstantAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[ConstantAnnotation]:
    if parameterv2.type is None:
        migrate_text = _get_migration_text(mapping, constant_annotation)
        return ConstantAnnotation(
            parameterv2.id,
            constant_annotation.authors,
            constant_annotation.reviewers,
            migrate_text
            if len(constant_annotation.comment) == 0
            else constant_annotation.comment + "\n" + migrate_text,
            EnumReviewResult.UNSURE,
            constant_annotation.defaultValueType,
            constant_annotation.defaultValue,
        )

    parameterv1 = get_api_element_from_mapping(constant_annotation, mapping, Parameter)
    if parameterv1 is None:
        return None
    if _have_same_type(
        constant_annotation.defaultValueType, parameterv1, parameterv2.type
    ):
        return ConstantAnnotation(
            parameterv2.id,
            constant_annotation.authors,
            constant_annotation.reviewers,
            constant_annotation.comment,
            EnumReviewResult.NONE,
            constant_annotation.defaultValueType,
            constant_annotation.defaultValue,
        )
    return None


def migrate_omitted_annotation(
    omitted_annotation: OmittedAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[OmittedAnnotation]:
    parameterv1 = get_api_element_from_mapping(omitted_annotation, mapping, Parameter)
    if parameterv1 is None:
        return None
    type_and_same_value = _have_same_value(parameterv1, parameterv2)
    if type_and_same_value is None:
        return None
    data_type, are_equal = type_and_same_value

    is_not_unsure = are_equal
    if parameterv2.type is not None and data_type is not None:
        is_not_unsure = are_equal and _have_same_type(
            data_type, parameterv1, parameterv2.type
        )
    review_result = EnumReviewResult.NONE if is_not_unsure else EnumReviewResult.UNSURE
    migrate_text = (
        _get_migration_text(mapping, omitted_annotation)
        if len(omitted_annotation.comment) == 0
        else omitted_annotation.comment
        + "\n"
        + _get_migration_text(mapping, omitted_annotation)
    )

    return OmittedAnnotation(
        parameterv2.id,
        omitted_annotation.authors,
        omitted_annotation.reviewers,
        omitted_annotation.comment if is_not_unsure else migrate_text,
        review_result,
    )


def migrate_optional_annotation(
    optional_annotation: OptionalAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[OptionalAnnotation]:
    parameterv1 = get_api_element_from_mapping(optional_annotation, mapping, Parameter)
    if parameterv1 is None:
        return None
    if parameterv2.type is not None and _have_same_type(
        optional_annotation.defaultValueType, parameterv1, parameterv2.type
    ):
        return OptionalAnnotation(
            parameterv2.id,
            optional_annotation.authors,
            optional_annotation.reviewers,
            optional_annotation.comment,
            EnumReviewResult.NONE,
            optional_annotation.defaultValueType,
            optional_annotation.defaultValue,
        )
    if parameterv2.type is None:
        migrate_text = _get_migration_text(mapping, optional_annotation)
        return OptionalAnnotation(
            parameterv2.id,
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
    parameterv1 = get_api_element_from_mapping(required_annotation, mapping, Parameter)
    if parameterv1 is None:
        return None
    type_and_same_value = _have_same_value(parameterv1, parameterv2)
    if type_and_same_value is None:
        return None
    return RequiredAnnotation(
        parameterv2.id,
        required_annotation.authors,
        required_annotation.reviewers,
        required_annotation.comment,
        EnumReviewResult.NONE,
    )
