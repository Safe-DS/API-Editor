import pytest
from package_parser.commands.generate_annotations._generate_unused_annotations import (
    format_name,
    generate_unused_annotations,
)

EXPECTED_VALUE = {
    "sklearn/sklearn.base/_BaseEstimator/__setstate__": {
        "target": "sklearn/sklearn.base/_BaseEstimator/__setstate__"
    },
    "sklearn/sklearn.base/is_regressor": {
        "target": "sklearn/sklearn.base/is_regressor"
    },
    "sklearn/sklearn.cluster._agglomerative/linkage_tree": {
        "target": "sklearn/sklearn.cluster._agglomerative/linkage_tree"
    },
    "sklearn/sklearn.cluster._kmeans/MiniBatchKMeans/init_size_": {
        "target": "sklearn/sklearn.cluster._kmeans/MiniBatchKMeans/init_size_"
    },
}


def test_format_underscores():
    assert (
        format_name("sklearn.cluster._kmeans._MiniBatchKMeans.random_state_")
        == "sklearn/sklearn.cluster._kmeans/_MiniBatchKMeans/random_state_"
    )


def test_format_uppercase():
    assert (
        format_name("sklearn.cluster._kmeans.MiniBatchKMeans.random_state_")
        == "sklearn/sklearn.cluster._kmeans/MiniBatchKMeans/random_state_"
    )


def test_format_normal():
    assert (
        format_name("sklearn.cluster._mean_shift.get_bin_seeds")
        == "sklearn/sklearn.cluster._mean_shift/get_bin_seeds"
    )


def test_format_one_part():
    assert format_name("test") == "sklearn/test"


def test_format_none():
    assert format_name(None) is None


def test_format_empty():
    assert format_name("") == "sklearn/"


def test_generate():
    assert (
        generate_unused_annotations(
            "tests/commands/generate_annotations/unused_functions_list.json"
        )
        == EXPECTED_VALUE
    )


def test_generate_bad_path():
    with pytest.raises(FileNotFoundError):
        generate_unused_annotations("aaaaaaaaaaaAAAAAAAAAAAA")
