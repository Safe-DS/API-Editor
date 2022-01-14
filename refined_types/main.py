"""Iterate over the `json` files inside the `sklearn` folder
and concatenate them to form `ground_truth.json`

Usage:
------
python sync.py
"""
import glob
import json


def sync():
    ground_truth = {}
    for filepath in glob.glob("sklearn/**/*json", recursive=True):
        with open(filepath, "r") as fin:
            json_file = json.load(fin)
        ground_truth.update(json_file)

    with open("ground_truth.json", "w") as fout:
        json.dump(ground_truth, fout, indent=4)


def get_class_name(filepath: str) -> str:
    filepath = filepath.replace("/", ".")
    filepath = filepath.removesuffix(".json")
    return filepath


def get_ground_truth() -> dict:
    with open("ground_truth.json", "r") as fin:
        ground_truth = json.load(fin)
    return ground_truth


def get_boundaries():
    ground_truth = get_ground_truth()
    boundaries = {}
    for cls, props in ground_truth.items():
        for prop_name, prop_body in props.items():
            ref_type = prop_body["refined_type"]
            if ref_type["kind"] == "BoundaryType":
                key = f"{cls}.{prop_name}"
                boundaries[key] = prop_body
            if ref_type["kind"] == "UnionType":
                for type in ref_type["types"]:
                    if type["kind"] == "BoundaryType":
                        key = f"{cls}.{prop_name}"
                        boundaries[key] = prop_body
    with open("boundaries.json", "w") as fout:
        json.dump(boundaries, fout, indent=4)


def stats():
    with open("ground_truth.json", "r") as fin:
        ground_truth = json.load(fin)

    num_classes = len(ground_truth)
    num_props = sum(len(ground_truth[class_name]) for class_name in ground_truth)

    print(f"Number of classes: {num_classes}")
    print(f"Number of properties with refined types: {num_props}")


if __name__ == "__main__":
    sync()
    # stats()
    get_boundaries()
