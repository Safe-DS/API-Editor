from typing import Optional

import pytest
from package_parser.model.api._types import EnumType


@pytest.mark.parametrize(
    "docstring_type,expected",
    [
        ('{"frobenius", "spectral"}, default="frobenius"', {"frobenius", "spectral"}),
        (
            "{'strict', 'ignore', 'replace'}, default='strict'",
            {"strict", "ignore", "replace"},
        ),
        (
            "{'linear', 'poly',             'rbf', 'sigmoid', 'cosine', 'precomputed'}, default='linear'",
            {"linear", "poly", "rbf", "sigmoid", "cosine", "precomputed"},
        ),
        # https://github.com/lars-reimann/sem21/pull/30#discussion_r771288528
        (r"{\"frobenius\", \'spectral\'}", set()),
        (r"""{"frobenius'}""", set()),
        (r"""{'spectral"}""", set()),
        (r"""{'text\", \"that'}""", {'text", "that'}),
        (r"""{'text", "that'}""", {'text", "that'}),
        (r"{'text\', \'that'}", {"text', 'that"}),
        (r"{'text', 'that'}", {"text", "that"}),
        (r"""{"text\', \'that"}""", {"text', 'that"}),
        (r"""{"text', 'that"}""", {"text', 'that"}),
        (r"""{"text\", \"that"}""", {'text", "that'}),
        (r'{"text", "that"}', {"text", "that"}),
        (r"""{\"not', 'be', 'matched'}""", {", ", ", "}),
        ("""{"gini\\", \\"entropy"}""", {'gini", "entropy'}),
        ("""{'best\\', \\'random'}""", {"best', 'random"}),
    ],
)
def test_enum_from_string(docstring_type: str, expected: Optional[set[str]]):
    result = EnumType.from_string(docstring_type)
    if result is not None:
        assert result.values == expected
