import json
import os
from pathlib import Path

import pytest
from package_parser.commands.find_usages import UsageStore
from package_parser.commands.generate_annotations.generate_annotations import (
    __get_constant_annotations,
    __get_unused_annotations,
    __qname_to_target_name,
    _preprocess_usages,
    generate_annotations,
)
from package_parser.commands.get_api import API
from package_parser.models.annotation_models import AnnotationStore

UNUSED_EXPECTED: dict[str, dict[str, str]] = {
    "test/test/Unused_Class": {"target": "test/test/Unused_Class"},
    "test/test/commonly_used_global_function/unused_optional_parameter": {
        "target": "test/test/commonly_used_global_function/unused_optional_parameter"
    },
    "test/test/unused_global_function": {"target": "test/test/unused_global_function"},
    "test/test/unused_global_function/unused_optional_parameter": {
        "target": "test/test/unused_global_function/unused_optional_parameter"
    },
    "test/test/unused_global_function/unused_required_parameter": {
        "target": "test/test/unused_global_function/unused_required_parameter"
    },
}

CONSTANT_EXPECTED: dict[str, dict[str, str]] = {
    "test/test/commonly_used_global_function/unused_optional_parameter": {
        "defaultType": "string",
        "defaultValue": "bla",
        "target": "test/test/commonly_used_global_function/unused_optional_parameter",
    },
    "test/test/commonly_used_global_function/useless_optional_parameter": {
        "defaultType": "string",
        "defaultValue": "bla",
        "target": "test/test/commonly_used_global_function/useless_optional_parameter",
    },
    "test/test/commonly_used_global_function/useless_required_parameter": {
        "defaultType": "string",
        "defaultValue": "blup",
        "target": "test/test/commonly_used_global_function/useless_required_parameter",
    },
}

REQUIREDS_EXPECTED: dict[str, dict[str, str]] = {}
OPTIONALS_EXPECTED: dict[str, dict[str, str]] = {}
BOUNDARIES_EXPECTED: dict[str, dict[str, str]] = {}
ENUMS_EXPECTED: dict[str, dict[str, str]] = {}

# Reihenfolge ist wichtig, siehe Reihenfolge von annotation_functions in generate_annotations.py
FULL_EXPECTED = {
    "constant": {**CONSTANT_EXPECTED},
    "unused": {**UNUSED_EXPECTED},
    "requireds": {**REQUIREDS_EXPECTED},
    "optionals": {**OPTIONALS_EXPECTED},
    "boundaries": {**BOUNDARIES_EXPECTED},
    "enums": {**ENUMS_EXPECTED},
}


def setup():
    api_json_path = os.path.join(os.getcwd(), "tests", "data", "api_data.json")
    usages_json_path = os.path.join(os.getcwd(), "tests", "data", "usage_data.json")

    with open(api_json_path, "r") as api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with open(usages_json_path, "r") as usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    return usages, api, usages_file, api_file, usages_json_path, api_json_path


def test_format_function():
    usages, api, usages_file, api_file, usages_json_path, api_json_path = setup()
    assert (
        __qname_to_target_name(api, "test.unused_global_function")
        == "test/test/unused_global_function"
    )


def test_format_parameter():
    usages, api, usages_file, api_file, usages_json_path, api_json_path = setup()
    assert (
        __qname_to_target_name(
            api, "test.commonly_used_global_function.useless_required_parameter"
        )
        == "test/test/commonly_used_global_function/useless_required_parameter"
    )


def test_format_none():
    usages, api, usages_file, api_file, usages_json_path, api_json_path = setup()
    with pytest.raises(ValueError):
        __qname_to_target_name(None, "test")
    with pytest.raises(ValueError):
        __qname_to_target_name(api, None)


def test_get_unused():
    usages, api, usages_file, api_file, usages_json_path, api_json_path = setup()
    annotations = AnnotationStore()
    _preprocess_usages(usages, api)
    __get_unused_annotations(usages, api, annotations)
    assert {
        annotation.target: annotation.to_json() for annotation in annotations.unused
    } == UNUSED_EXPECTED


def test_get_constant():
    usages, api, usages_file, api_file, usages_json_path, api_json_path = setup()
    annotations = AnnotationStore()
    _preprocess_usages(usages, api)
    __get_constant_annotations(usages, api, annotations)
    assert {
        annotation.target: annotation.to_json() for annotation in annotations.constant
    } == CONSTANT_EXPECTED


def test_generate():
    usages, api, usages_file, api_file, usages_json_path, api_json_path = setup()
    out_file_path = os.path.join(
        os.getcwd(), "tests", "out", "test_generate_out_file.json"
    )

    if not os.path.exists(os.path.join(os.getcwd(), "tests", "out")):
        os.makedirs(os.path.join(os.getcwd(), "tests", "out"))

    if not os.path.exists(out_file_path) or not os.path.isfile(out_file_path):
        with open(out_file_path, "x") as out_file:
            out_file.write("")

    generate_annotations(
        open(api_json_path, "r"), open(usages_json_path, "r"), Path(out_file_path)
    )
    with open(out_file_path, "r") as out_file:
        out_json = json.load(out_file)
        assert out_json == FULL_EXPECTED


def test_generate_bad_path():
    with pytest.raises(ValueError):
        generate_annotations(None, None, None)
