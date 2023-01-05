from copy import deepcopy
from typing import Optional

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
from ._get_annotated_api_element import get_annotated_api_element_by_type
from ._get_migration_text import get_migration_text


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
                get_migration_text(value_annotation, mapping),
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
                elif isinstance(value_annotation, OmittedAnnotation):
                    migrated_omitted_annotation = migrate_omitted_annotation(
                        value_annotation, parameter, mapping
                    )
                    if migrated_omitted_annotation is not None:
                        migrated_annotations.append(migrated_omitted_annotation)
                        continue
                elif isinstance(value_annotation, OptionalAnnotation):
                    migrated_optional_annotation = migrate_optional_annotation(
                        value_annotation, parameter, mapping
                    )
                    if migrated_optional_annotation is not None:
                        migrated_annotations.append(migrated_optional_annotation)
                        continue
                elif isinstance(value_annotation, RequiredAnnotation):
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
                        EnumReviewResult.NONE,
                        get_migration_text(value_annotation, mapping),
                    )
                )
    return migrated_annotations


def _have_same_type(
    typev1: Optional[AbstractType],
    typev2: Optional[AbstractType],
) -> bool:
    if typev2 is None and typev1 is None:
        return True
    if typev2 is None or typev1 is None:
        return False
    if isinstance(typev2, NamedType):
        if typev2.name in ("int", "interger") or typev2.name.startswith("int "):
            types = [typev1]
            if isinstance(typev1, UnionType):
                types = typev1.types
            for element in types:
                if isinstance(element, NamedType) and (
                    element.name in ("int", "integer")
                    or element.name.startswith("int ")
                ):
                    return True
        elif typev2.name == "float" or typev2.name.startswith("float "):
            types = [typev1]
            if isinstance(typev1, UnionType):
                types = typev1.types
            for element in types:
                if isinstance(element, NamedType) and (
                    element.name == "float" or element.name.startswith("float ")
                ):
                    return True
        elif typev2.name in ("bool", "boolean"):
            types = [typev1]
            if isinstance(typev1, UnionType):
                types = typev1.types
            for element in types:
                if isinstance(element, NamedType) and (
                    element.name in ("bool", "boolean")
                ):
                    return True
        elif typev2.name in ("str", "string"):
            types = [typev1]
            if isinstance(typev1, UnionType):
                types = typev1.types
            for element in types:
                if isinstance(element, NamedType) and (
                    element.name in ("str", "string")
                ):
                    return True
    elif isinstance(typev2, UnionType):
        for element in typev2.types:
            if _have_same_type(typev1, element):
                return True
    return False


def _have_same_value(
    parameterv1_default_value: Optional[str], parameterv2_default_value: Optional[str]
) -> bool:
    if parameterv1_default_value is None and parameterv2_default_value is None:
        return True
    if parameterv1_default_value is None or parameterv2_default_value is None:
        return False
    if parameterv1_default_value == "None" and parameterv2_default_value == "None":
        return True
    try:
        intv1_value = int(parameterv1_default_value)
        intv2_value = int(parameterv2_default_value)
        return intv1_value == intv2_value
    except ValueError:
        try:
            floatv1_value = float(parameterv1_default_value)
            floatv2_value = float(parameterv2_default_value)
            return floatv1_value == floatv2_value
        except ValueError:
            try:
                int(parameterv1_default_value)
                float(parameterv2_default_value)
                return False
            except ValueError:
                try:
                    int(parameterv2_default_value)
                    float(parameterv1_default_value)
                    return False
                except ValueError:
                    pass
    if parameterv1_default_value in (
        "True",
        "False",
    ) and parameterv2_default_value in ("True", "False"):
        return bool(parameterv1_default_value) == bool(parameterv2_default_value)
    valuev1_is_in_quotation_marks = (
        parameterv1_default_value.startswith("'")
        and parameterv1_default_value.endswith("'")
    ) or (
        parameterv1_default_value.startswith('"')
        and parameterv1_default_value.endswith('"')
    )
    valuev2_is_in_quotation_marks = (
        parameterv2_default_value.startswith("'")
        and parameterv2_default_value.endswith("'")
    ) or (
        parameterv2_default_value.startswith('"')
        and parameterv2_default_value.endswith('"')
    )
    if valuev1_is_in_quotation_marks and valuev2_is_in_quotation_marks:
        return parameterv1_default_value[1:-1] == parameterv2_default_value[1:-1]
    return False


def migrate_constant_annotation(
    constant_annotation: ConstantAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[ConstantAnnotation]:
    parameterv1 = get_annotated_api_element_by_type(
        constant_annotation, mapping.get_apiv1_elements(), Parameter
    )
    if parameterv1 is None:
        return None
    if not _have_same_type(parameterv1.type, parameterv2.type):
        return None
    if not _have_same_value(parameterv1.default_value, parameterv2.default_value):
        return ConstantAnnotation(
            parameterv2.id,
            constant_annotation.authors,
            constant_annotation.reviewers,
            get_migration_text(constant_annotation, mapping),
            EnumReviewResult.UNSURE,
            constant_annotation.defaultValueType,
            constant_annotation.defaultValue,
        )
    return ConstantAnnotation(
        parameterv2.id,
        constant_annotation.authors,
        constant_annotation.reviewers,
        constant_annotation.comment,
        EnumReviewResult.NONE,
        constant_annotation.defaultValueType,
        constant_annotation.defaultValue,
    )


def migrate_omitted_annotation(
    omitted_annotation: OmittedAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[OmittedAnnotation]:
    parameterv1 = get_annotated_api_element_by_type(
        omitted_annotation, mapping.get_apiv1_elements(), Parameter
    )
    if parameterv1 is None:
        return None
    if _have_same_type(parameterv1.type, parameterv2.type) and _have_same_value(
        parameterv1.default_value, parameterv2.default_value
    ):
        return OmittedAnnotation(
            parameterv2.id,
            omitted_annotation.authors,
            omitted_annotation.reviewers,
            omitted_annotation.comment,
            EnumReviewResult.NONE,
        )
    if _have_same_type(parameterv1.type, parameterv2.type) and not _have_same_value(
        parameterv1.default_value, parameterv2.default_value
    ):
        return OmittedAnnotation(
            parameterv2.id,
            omitted_annotation.authors,
            omitted_annotation.reviewers,
            get_migration_text(omitted_annotation, mapping),
            EnumReviewResult.UNSURE,
        )

    return None


def migrate_optional_annotation(
    optional_annotation: OptionalAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[OptionalAnnotation]:
    parameterv1 = get_annotated_api_element_by_type(
        optional_annotation, mapping.get_apiv1_elements(), Parameter
    )
    if parameterv1 is None:
        return None
    if _have_same_type(parameterv1.type, parameterv2.type) and _have_same_value(
        parameterv1.default_value, parameterv2.default_value
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
    have_implicit_same_value = False
    if parameterv1.default_value is not None and parameterv2.default_value is not None:
        try:
            have_implicit_same_value = float(parameterv1.default_value) == float(
                parameterv2.default_value
            )
        except ValueError:
            pass
    if (
        _have_same_type(parameterv1.type, parameterv2.type)
        or (
            (parameterv1.default_value is None)
            is not (parameterv2.default_value is None)
        )
        or have_implicit_same_value
    ):
        return OptionalAnnotation(
            parameterv2.id,
            optional_annotation.authors,
            optional_annotation.reviewers,
            get_migration_text(optional_annotation, mapping),
            EnumReviewResult.UNSURE,
            optional_annotation.defaultValueType,
            optional_annotation.defaultValue,
        )

    return None


def migrate_required_annotation(
    required_annotation: RequiredAnnotation, parameterv2: Parameter, mapping: Mapping
) -> Optional[RequiredAnnotation]:
    parameterv1 = get_annotated_api_element_by_type(
        required_annotation, mapping.get_apiv1_elements(), Parameter
    )
    if parameterv1 is None:
        return None
    if _have_same_type(parameterv1.type, parameterv2.type) and (
        (
            parameterv1.default_value is not None
            and parameterv2.default_value is not None
        )
        or (parameterv1.default_value is None and parameterv2.default_value is None)
    ):
        return RequiredAnnotation(
            parameterv2.id,
            required_annotation.authors,
            required_annotation.reviewers,
            required_annotation.comment,
            EnumReviewResult.NONE,
        )
    return None
