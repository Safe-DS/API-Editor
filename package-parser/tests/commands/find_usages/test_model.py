import json
import os

from package_parser.commands.find_usages import UsageStore


def setup():
    usages_json_path = os.path.join(
        os.getcwd(), "tests", "commands", "find_usages", "data", "usage_data.json"
    )

    with open(usages_json_path, "r") as usages_file:
        usages_json = json.load(usages_file)
        usages = UsageStore.from_json(usages_json)

    return usages, usages_file, usages_json_path


def test_to_count_json():
    usages, usages_file, usages_json_path = setup()

    result = usages.to_count_json()

    assert result == {
        "class_counts": {"test.Commonly_Used_Class": 2, "test.Unused_Class": 1},
        "function_counts": {
            "test.commonly_used_function": 2,
            "test.unused_function": 1,
        },
        "parameter_counts": {
            "test.commonly_used_global_function.often_used_parameter": 2,
            "test.uncommonly_used_global_function.never_used_parameter": 1,
        },
        "value_counts": {
            "test.commonly_used_global_function.often_used_parameter": {
                "'bla'": 2,
                "'blup'": 1,
            }
        },
    }
