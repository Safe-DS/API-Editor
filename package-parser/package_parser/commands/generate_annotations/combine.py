import argparse
import json

# Funktion zum kombinieren der constant und unused anotations
# @params:
# output : Dateipfad für Output JSON
# constant_path : Dateipfad zur Constant Annotation File
# unused_path : Dateipfad zur Unused Annotation File

def combine(output, constant_path, unused_path):

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
            "defaultValue": True
        },
        "sklearn/sklearn._config/config_context/working_memory": {
            "target": "sklearn/sklearn._config/config_context/working_memory",
            "defaultType": "string",
            "defaultValue": "bla"
        },
        "sklearn/sklearn._config/config_context/print_changed_only": {
            "target": "sklearn/sklearn._config/config_context/print_changed_only",
            "defaultType": "none",
            "defaultValue": None
        },
        "sklearn/sklearn._config/config_context/display": {
            "target": "sklearn/sklearn._config/config_context/display",
            "defaultType": "number",
            "defaultValue": "3"
        }
    }
    create_file(output, unused_dict, constant_dict)


# Funktion, die die Dictionarys kombiniert und daraus eine JSON-FILE generiert
# @params:
# output : Dateipfad der JSON-File
# unused_dict : Dictionary der unused annotations
# constant_dict : Dictionary der constant annotations

def create_file(output, unused_dict, constant_dict):
    with open(f"{output}\\annotations.json", "w") as file:
        json.dump(
            {
                "unused": unused_dict,
                "constant": constant_dict,
            },
            file,
            indent=2,
        )


if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog='combine')

    parser.add_argument('outputPath', metavar='output-filepath', type=str,
                        help='paste the location of the output file in here ')

    parser.add_argument('constantPath', metavar='input-filepath', type=str,
                        help='paste the location of the "constant" file in here ')

    parser.add_argument('unusedPath', metavar='input-filepath', type=str,
                        help='paste the location of the "unused" file in here ')

    args = parser.parse_args()

    combine(args.outputPath, args.constantPath, args.unusedPath)
