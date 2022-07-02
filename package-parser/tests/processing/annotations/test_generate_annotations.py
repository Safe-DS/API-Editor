import json
import os

import pytest
from package_parser.processing.annotations import generate_annotations
from package_parser.processing.api.model import API
from package_parser.processing.usages.model import UsageCountStore


@pytest.mark.parametrize(
    "subfolder",
    [
        "boundaryAnnotations",
        "enumAnnotations",
        "removeAnnotations",
        "valueAnnotations",
    ],
)
def test_generate_annotations(
    subfolder: str,
):
    usages, api, expected_annotations = read_test_data(subfolder)
    annotations = generate_annotations(api, usages)

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
