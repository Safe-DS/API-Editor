import argparse
import json
import os


def write_json(output_path: str, constant_path: str, unused_path: str) -> None:
    """
    Dient zum Mergen von Unused-Dictionary und Constant-Dictionary und anschließende Erzeugen einer JSON - File,
    die das erzeugte Dictionary beinhaltet.

    :param output_path: Dateipfad für Output-JSON aus beiden Dictionaries(Unused und Constant)
    :param constant_path: Dateipfad zur Constant Annotation File, die eine Constant Dictionary enthält
    :param  unused_path: Dateipfad zur Unused Annotation File, die eine Unused Dictionary enthält
    """
    # Platzhalter für echte Funktion
    # unused_dict = find_unused(unused_path)

    # entfernen, wenn Funktion aus Issue 433 fertig
    unused_dict = {
        "sklearn/sklearn.__check_build/raise_build_error": {
            "target": "sklearn/sklearn.__check_build/raise_build_error"
        }
    }
    # Platzhalter für echte Funktion
    # constant_dict = find_constant(constant_path)

    # entfernen, wenn Funktion aus Issue 434 fertig
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
    result_dict = __combine_dictionaries(unused_dict, constant_dict)

    with open(os.path.join(output_path, "annotations.json"), "w") as file:
        json.dump(
            result_dict,
            file,
            indent=2,
        )


def __combine_dictionaries(unused_dict: dict, constant_dict: dict) -> dict:
    """
    Funktion, die die Dictionaries kombiniert
    :param  unused_dict : Dictionary der unused annotations
    :param constant_dict : Dictionary der constant annotations
    :return result_dict : Kombiniertes Dictionary
    """

    result_dict = {
        "unused": unused_dict,
        "constant": constant_dict,
    }
    return result_dict


# sollte, sobald final eingebunden wird entfernt werden, da es nicht weiter benötigt wird, dient zZ. nur zur Anschauung
if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog="combine")

    # Argument 1: outputPath
    parser.add_argument(
        "outputPath",
        metavar="output-filepath",
        type=str,
        help="paste the location of the output file in here ",
    )
    # Argument 2: inputPath(Pfad einer Constant-Datei)
    parser.add_argument(
        "constantPath",
        metavar="input-filepath",
        type=str,
        help='paste the location of the "constant" file in here ',
    )
    # Argument 3: inputPath(Pfad einer Unused-Datei)
    parser.add_argument(
        "unusedPath",
        metavar="input-filepath",
        type=str,
        help='paste the location of the "unused" file in here ',
    )
    # Erzeuge kombinierte JSON-Datei jeweils aus der Constant- und der Unused-Dictionary
    args = parser.parse_args()  # Argumente werden auf Nutzen als Parameter vorbereitet
    write_json(args.outputPath, args.constantPath, args.unusedPath)
