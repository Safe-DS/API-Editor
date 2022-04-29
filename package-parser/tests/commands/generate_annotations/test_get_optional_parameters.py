import os

from package_parser.commands.generate_annotations._generate_annotations import (
    generate_annotations,
)


def test_determination_of_constant_parameters():
    expected = {
        "sklearn/sklearn._config/config_context/working_memory": {
            "target": "sklearn/sklearn._config/config_context/working_memory",
            "defaultType": "string",
            "defaultValue": "bla"
        }
    }

    api_json_path = os.path.join(
        os.getcwd(), "tests", "data", "optional", "api_data.json"
    )
    usages_json_path = os.path.join(
        os.getcwd(), "tests", "data", "optional", "usage_data.json"
    )

    api_file = open(api_json_path)
    usages_file = open(usages_json_path)

    all_parameters = generate_annotations(api_file, usages_file, "/.")

    api_file.close()
    usages_file.close()

    # print('allParams: ' + all_parameters);
    # print('expected: ' + expected['optional']);

    assert all_parameters == expected['optional']
