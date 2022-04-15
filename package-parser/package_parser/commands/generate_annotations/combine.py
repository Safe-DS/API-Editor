import argparse
import json

# Funktion zum kombinieren der constant und unused anotations und zur Erzeugung einer JSON - File
# @params:
# output : Dateipfad für Output JSON
# constant_path : Dateipfad zur Constant Annotation File
# unused_path : Dateipfad zur Unused Annotation File


def write_json(output_path, constant_path, unused_path):
    # Platzhalter für echte Funktion
    # unused_dict = find_unused(unused_path)

    unused_dict = {
        "sklearn/sklearn.__check_build/raise_build_error": {
            "target": "sklearn/sklearn.__check_build/raise_build_error"
        }
    }
    # Platzhalter für echte Funktion
    # constant_dict = find_constant(constant_path)

    constant_dict = {
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
    result_dict = combine_dictionaries(unused_dict, constant_dict)
    '''
    result_dict = combine_dictionaries(module.unusedDictFunction, module.constantDictFunction)
     Those 2 functions have each to return the different dictionaries, comming soon.
     '''
    with open(f"{output_path}\\annotations.json", "w") as file:
        json.dump(
            result_dict,
            file,
            indent=2,
        )


# Funktion, die die Dictionarys kombiniert
# @params:
# unused_dict : Dictionary der unused annotations
# constant_dict : Dictionary der constant annotations


def combine_dictionaries(unused_dict, constant_dict):
    result_dict = {
        "unused": unused_dict,
        "constant": constant_dict,
    }
    return result_dict


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="combine")

    parser.add_argument(
        "outputPath",
        metavar="output-filepath",
        type=str,
        help="paste the location of the output file in here ",
    )

    parser.add_argument(
        "constantPath",
        metavar="input-filepath",
        type=str,
        help='paste the location of the "constant" file in here ',
    )

    parser.add_argument(
        "unusedPath",
        metavar="input-filepath",
        type=str,
        help='paste the location of the "unused" file in here ',
    )

    args = parser.parse_args()

    write_json(args.outputPath, args.constantPath, args.unusedPath)
