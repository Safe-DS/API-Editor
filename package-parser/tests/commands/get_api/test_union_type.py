import pytest
from package_parser.commands.get_api import UnionType


@pytest.mark.parametrize(
    "docstring_type,expected",
    [
        ("", []),
        (
            "int or float >= 0.0, or None, 'manual', {'auto', 'sqrt', 'log2'}, default='auto'",
            ["{'auto', 'sqrt', 'log2'}", "int", "float >= 0.0", "None", "'manual'"],
        ),
        (
            "tuple of slice, AUTO or True, array of shape (12,2), default=(slice(70, 195), slice(78, 172))",
            ["tuple of slice", "AUTO", "True", "array of shape (12,2)"],
        ),
        ("object", []),
        (
            "ndarray, shape (n_samples,), default=None",
            ["ndarray", "shape (n_samples,)"],
        ),
        ("estor adventus or None", ["estor adventus", "None"]),
        (
            "int or array-like, shape (n_samples, n_classes) or (n_samples, 1)                     when binary.",
            [
                "int",
                "array-like",
                "shape (n_samples, n_classes) or (n_samples, 1) when binary.",
            ],
        ),
    ],
)
def test_union_from_string(docstring_type: str, expected: list[str]):
    result = UnionType.from_string(docstring_type)
    assert result.as_list() == expected
