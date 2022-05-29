from typing import Optional

import pytest
from package_parser.commands.get_api._refined_types import BoundaryType


@pytest.mark.parametrize(
    "string,expected",
    [
        (
            "float, default=0.0 Tolerance for singular values computed by svd_solver == 'arpack'.\nMust be of range [0.0, infinity).\n\n.. versionadded:: 0.18.0",
            BoundaryType("float", 0, "Infinity", True, True),
        ),
        (
            """If bootstrap is True, the number of samples to draw from X\nto train each base estimator.\n\n
            - If None (default), then draw `X.shape[0]` samples.\n- If int, then draw `max_samples` samples.\n
            - If float, then draw `max_samples * X.shape[0]` samples. Thus,\n  `max_samples` should be in the interval `(0.0, 1.0]`.\n\n..
            versionadded:: 0.22""",
            BoundaryType("float", 0, 1, False, True),
        ),
        (
            """When building the vocabulary ignore terms that have a document\nfrequency strictly lower than the given threshold. This value is also\n
            called cut-off in the literature.\nIf float in range of [0.0, 1.0], the parameter represents a proportion\nof documents, integer absolute counts.\n
            This parameter is ignored if vocabulary is not None.""",
            BoundaryType("float", 0, 1, True, True),
        ),
        (
            """float in range [0.0, 1.0] or int, default=1.0 When building the vocabulary ignore terms that have a document\n
            frequency strictly higher than the given threshold (corpus-specific\nstop words).\nIf float, the parameter represents a proportion of documents, integer\n
            absolute counts.\nThis parameter is ignored if vocabulary is not None.""",
            BoundaryType("float", 0, 1, True, True),
        ),
        (
            "Tolerance for singular values computed by svd_solver == 'arpack'.\nMust be of range [-2, -1].\n\n.. versionadded:: 0.18.0",
            BoundaryType("float", -2, -1, True, True),
        ),
        (
            "Damping factor in the range (-1, -0.5)",
            BoundaryType("float", -1, -0.5, False, False),
        ),
        (
            "'max_samples' should be in the interval (-1.0, -0.5]",
            BoundaryType("float", -1.0, -0.5, False, True),
        ),
    ],
)
def test_boundaries_from_string(string: str, expected: BoundaryType):
    ref_type = BoundaryType.from_string(string)
    assert ref_type == expected
