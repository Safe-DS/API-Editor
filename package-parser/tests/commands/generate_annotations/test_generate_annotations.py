import json
import os
from typing import Callable

import pytest
from package_parser.commands.generate_annotations.generate_annotations import (
    __get_boundary_annotations,
    __get_constant_annotations,
    __get_enum_annotations,
    __get_optional_annotations,
    __get_required_annotations,
    __get_unused_annotations,
    preprocess_usages,
)
from package_parser.commands.get_api import API
from package_parser.models import UsageCountStore
from package_parser.models.annotation_models import AnnotationStore


@pytest.mark.parametrize(
    "subfolder, get_annotations",
    [
        ("unuseds", __get_unused_annotations),
        ("constants", __get_constant_annotations),
        ("requireds", __get_required_annotations),
        ("optionals", __get_optional_annotations),
        ("enums", __get_enum_annotations),
        ("boundaries", __get_boundary_annotations),
    ],
)
def test_get_annotations(
    subfolder: str,
    get_annotations: Callable[[UsageCountStore, API, AnnotationStore], None],
):
    usages, api, expected_annotations = read_test_data(subfolder)

    preprocess_usages(usages, api)
    annotations = AnnotationStore()
    get_annotations(usages, api, annotations)

    assert annotations.to_json()[subfolder] == expected_annotations


def read_test_data(subfolder: str):
    api_json_path = os.path.join(
        os.getcwd(), "tests", "data", subfolder, "api_data.json"
    )
    usages_json_path = os.path.join(
        os.getcwd(), "tests", "data", subfolder, "usage_data.json"
    )
    annotations_json_path = os.path.join(
        os.getcwd(), "tests", "data", subfolder, "annotation_data.json"
    )

    with open(api_json_path, "r") as api_file:
        api_json = json.load(api_file)
        api = API.from_json(api_json)

    with open(usages_json_path, "r") as usages_file:
        usages_json = json.load(usages_file)
        usages = UsageCountStore.from_json(usages_json)

    with open(annotations_json_path, "r") as annotations_file:
        annotations_json = json.load(annotations_file)

    return usages, api, annotations_json
