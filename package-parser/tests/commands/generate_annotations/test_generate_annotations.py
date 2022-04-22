import json
import os
import pytest
from io import TextIOWrapper

from commands.find_usages import UsageStore
from commands.get_api import API
from package_parser.commands.generate_annotations._generate_annotations import (
    __get_unused_annotations, generate_annotations, __qname_to_target_name
)

UNUSED_EXPECTED = {"unused": {
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
}

CONSTANT_EXPECTED = {"constant": {
    "test/test/commonly_used_global_function/useless_required_parameter": {
        "target": "test/test/commonly_used_global_function/useless_required_parameter",
        "defaultType": "string",
        "defaultValue": "blup",
    },
    "test/test/commonly_used_global_function/unused_optional_parameter": {
        "target": "test/test/commonly_used_global_function/unused_optional_parameter",
        "defaultType": "string",
        "defaultValue": "bla",
    },
    "test/test/commonly_used_global_function/useless_optional_parameter": {
        "target": "test/test/commonly_used_global_function/useless_optional_parameter",
        "defaultType": "string",
        "defaultValue": "bla",
    },
}
}

# Reihenfolge ist wichtig, siehe Reihenfolge von annotation_functions in generate_annotations.py
FULL_EXPECTED = {**UNUSED_EXPECTED, **CONSTANT_EXPECTED}


def setup():
    api_json_path = os.path.join(os.getcwd(), "tests", "data", "constant", "api_data.json")
    usages_json_path = os.path.join(os.getcwd(), "tests", "data", "constant", "usage_data.json")

    api_file = open(api_json_path)
    usages_file = open(usages_json_path)

    with api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    return usages, api, usages_file, api_file


def test_format_underscores():
    usages, api, usages_file, api_file = setup()
    assert (
        __qname_to_target_name(api, "sklearn.cluster._kmeans._MiniBatchKMeans.random_state_")
        == "sklearn/sklearn.cluster._kmeans/_MiniBatchKMeans/random_state_"
    )


def test_format_uppercase():
    usages, api, usages_file, api_file = setup()
    assert (
        __qname_to_target_name(api, "sklearn.cluster._kmeans.MiniBatchKMeans.random_state_")
        == "sklearn/sklearn.cluster._kmeans/MiniBatchKMeans/random_state_"
    )


def test_format_normal():
    usages, api, usages_file, api_file = setup()
    assert (
        __qname_to_target_name(api, "sklearn.cluster._mean_shift.get_bin_seeds")
        == "sklearn/sklearn.cluster._mean_shift/get_bin_seeds"
    )


def test_format_one_part():
    usages, api, usages_file, api_file = setup()
    assert __qname_to_target_name(api, "test") == "sklearn/test"


def test_format_none():
    usages, api, usages_file, api_file = setup()
    with pytest.raises(ValueError):
        __qname_to_target_name(None, "test")
    with pytest.raises(ValueError):
        __qname_to_target_name(api, None)


def test_get_unused():
    usages, api, usages_file, api_file = setup()
    assert __get_unused_annotations(usages, api) == UNUSED_EXPECTED


def test_get_constant():
    usages, api, usages_file, api_file = setup()
    assert __get_unused_annotations(usages, api) == CONSTANT_EXPECTED


def test_generate():
    usages, api, usages_file, api_file = setup()
    out_file_path = os.path.join(os.getcwd(), "tests", "out", "test_generate_out_file.json")

    if not os.path.exists(os.path.join(os.getcwd(), "tests", "out")):
        os.makedirs(os.path.join(os.getcwd(), "tests", "out"))

    out_file = TextIOWrapper(open(out_file_path, "x"))

    generate_annotations(usages_file, api_file, out_file)
    with out_file:
        out_json = json.load(out_file)
        assert out_json == "FULL_EXPECTED"


def test_generate_bad_path():
    with pytest.raises(ValueError):
        generate_annotations(None, None, None)
