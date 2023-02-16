from copy import deepcopy
from typing import Any

import pytest
from package_parser.processing.api.model import (
    Attribute,
    BoundaryType,
    EnumType,
    NamedType,
    Parameter,
    ParameterAssignment,
    ParameterDocumentation,
    create_type,
)


@pytest.mark.parametrize(
    "docstring_type,expected",
    [
        ("", {}),
        (
            "int, or None, 'manual', {'auto', 'sqrt', 'log2'}, default='auto'",
            {
                "kind": "UnionType",
                "types": [
                    {"kind": "EnumType", "values": {"auto", "log2", "sqrt"}},
                    {"kind": "NamedType", "name": "int"},
                    {"kind": "NamedType", "name": "None"},
                    {"kind": "NamedType", "name": "'manual'"},
                ],
            },
        ),
        (
            "tuple of slice, AUTO or array of shape (12,2), default=(slice(70, 195), slice(78, 172))",
            {
                "kind": "UnionType",
                "types": [
                    {"kind": "NamedType", "name": "tuple of slice"},
                    {"kind": "NamedType", "name": "AUTO"},
                    {"kind": "NamedType", "name": "array of shape (12,2)"},
                ],
            },
        ),
        ("object", {"kind": "NamedType", "name": "object"}),
        (
            "ndarray, shape (n_samples,), default=None",
            {
                "kind": "UnionType",
                "types": [
                    {"kind": "NamedType", "name": "ndarray"},
                    {"kind": "NamedType", "name": "shape (n_samples,)"},
                ],
            },
        ),
        (
            "estor adventus or None",
            {
                "kind": "UnionType",
                "types": [
                    {"kind": "NamedType", "name": "estor adventus"},
                    {"kind": "NamedType", "name": "None"},
                ],
            },
        ),
        (
            "int or array-like, shape (n_samples, n_classes) or (n_samples, 1)                     when binary.",
            {
                "kind": "UnionType",
                "types": [
                    {"kind": "NamedType", "name": "int"},
                    {"kind": "NamedType", "name": "array-like"},
                    {
                        "kind": "NamedType",
                        "name": "shape (n_samples, n_classes) or (n_samples, 1) when "
                        "binary.",
                    },
                ],
            },
        ),
    ],
)  # type: ignore
def test_union_from_string(docstring_type: str, expected: dict[str, Any]) -> None:
    result = create_type(ParameterDocumentation(docstring_type, "", ""))
    if result is None:
        assert expected == {}
    else:
        assert result.to_json() == expected


@pytest.mark.parametrize(
    "description,expected",
    [
        (
            "Scale factor between inner and outer circle in the range `[0, 1)`",
            {
                "base_type": "float",
                "kind": "BoundaryType",
                "max": 1.0,
                "max_inclusive": False,
                "min": 0.0,
                "min_inclusive": True,
            },
        ),
        (
            "Tolerance for singular values computed by svd_solver == 'arpack'.\nMust be of range [1, infinity].\n\n.. versionadded:: 0.18.0",
            {
                "base_type": "float",
                "kind": "BoundaryType",
                "max": "Infinity",
                "max_inclusive": True,
                "min": 1.0,
                "min_inclusive": True,
            },
        ),
        ("", {}),
    ],
)  # type: ignore
def test_boundary_from_string(description: str, expected: dict[str, Any]) -> None:
    result = create_type(ParameterDocumentation("", "", description))
    if result is None:
        assert expected == {}
    else:
        assert result.to_json() == expected


@pytest.mark.parametrize(
    "docstring_type,docstring_description,expected",
    [
        (
            "int or 'Auto', or {'today', 'yesterday'}",
            "int in the range `[0, 10]`",
            {
                "kind": "UnionType",
                "types": [
                    {
                        "base_type": "int",
                        "kind": "BoundaryType",
                        "max": 10.0,
                        "max_inclusive": True,
                        "min": 0.0,
                        "min_inclusive": True,
                    },
                    {"kind": "EnumType", "values": {"yesterday", "today"}},
                    {"kind": "NamedType", "name": "int"},
                    {"kind": "NamedType", "name": "'Auto'"},
                ],
            },
        ),
    ],
)  # type: ignore
def test_boundary_and_union_from_string(
    docstring_type: str, docstring_description: str, expected: dict[str, Any]
) -> None:
    result = create_type(
        ParameterDocumentation(
            type=docstring_type, default_value="", description=docstring_description
        )
    )

    if result is None:
        assert expected == {}
    else:
        assert result.to_json() == expected


def test_correct_hash() -> None:
    parameter = Parameter(
        "test/test.Test/test/test_parameter_for_hashing",
        "test_parameter_for_hashing",
        "test.Test.test.test_parameter_for_hashing",
        "'test_str'",
        ParameterAssignment.POSITION_OR_NAME,
        True,
        ParameterDocumentation("'hashvalue'", "r", "r"),
    )
    assert hash(parameter) == hash(deepcopy(parameter))
    enum_type = EnumType({"a", "b", "c"}, "full_match")
    assert enum_type == deepcopy(enum_type)
    assert hash(enum_type) == hash(deepcopy(enum_type))
    assert enum_type == EnumType({"a", "c", "b"}, "full_match")
    assert hash(enum_type) == hash(EnumType({"a", "c", "b"}, "full_match"))
    assert enum_type != EnumType({"a", "b"}, "full_match")
    assert hash(enum_type) != hash(EnumType({"a", "b"}, "full_match"))
    assert NamedType("a") == NamedType("a")
    assert hash(NamedType("a")) == hash(NamedType("a"))
    assert NamedType("a") != NamedType("b")
    assert hash(NamedType("a")) != hash(NamedType("b"))
    attribute = Attribute("boundary", BoundaryType("int", 0, 1, True, True))
    assert attribute == deepcopy(attribute)
    assert hash(attribute) == hash(deepcopy(attribute))
