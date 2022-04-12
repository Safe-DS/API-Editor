import json
import os

import package_parser.commands.generate_annotations.combine as comb
import pytest

test_unused_dict = {
    "sklearn/sklearn.__check_build/raise_build_error": {
        "target": "sklearn/sklearn.__check_build/raise_build_error"
    }
}

test_constant_dict = {
    "sklearn/sklearn._config/config_context/assume_finite": {
        "target": "sklearn/sklearn._config/config_context/assume_finite",
        "defaultType": "boolean",
        "defaultValue": True,
    },
    "sklearn/sklearn._config/config_context/working_memory": {
        "target": "sklearn/sklearn._config/config_context/working_memory",
        "defaultType": "string",
        "defaultValue": "bla",
    },
    "sklearn/sklearn._config/config_context/print_changed_only": {
        "target": "sklearn/sklearn._config/config_context/print_changed_only",
        "defaultType": "none",
        "defaultValue": None,
    },
    "sklearn/sklearn._config/config_context/display": {
        "target": "sklearn/sklearn._config/config_context/display",
        "defaultType": "number",
        "defaultValue": "3",
    },
}

test_combined_dict = {
    "unused": {
        "sklearn/sklearn.__check_build/raise_build_error": {
            "target": "sklearn/sklearn.__check_build/raise_build_error"
        }
    },
    "constant": {
        "sklearn/sklearn._config/config_context/assume_finite": {
            "target": "sklearn/sklearn._config/config_context/assume_finite",
            "defaultType": "boolean",
            "defaultValue": True,
        },
        "sklearn/sklearn._config/config_context/working_memory": {
            "target": "sklearn/sklearn._config/config_context/working_memory",
            "defaultType": "string",
            "defaultValue": "bla",
        },
        "sklearn/sklearn._config/config_context/print_changed_only": {
            "target": "sklearn/sklearn._config/config_context/print_changed_only",
            "defaultType": "none",
            "defaultValue": None,
        },
        "sklearn/sklearn._config/config_context/display": {
            "target": "sklearn/sklearn._config/config_context/display",
            "defaultType": "number",
            "defaultValue": "3",
        },
    },
}


@pytest.mark.parametrize(
    "test_unused, test_constant, expected",
    [
        (test_unused_dict, test_constant_dict, test_combined_dict),
    ],
)
def test_combine_dictionaries(test_unused, test_constant, expected):
    eval_dict = comb.combine_dictionaries(test_unused, test_constant)
    assert eval_dict == expected
