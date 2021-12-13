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


def extract_docstrings():
    with open("ground_truth.json", "r") as fin:
        ground_truth = json.load(fin)

    with open("docstrings.txt", "w") as fout:
        for class_name in ground_truth:
            class_props = ground_truth[class_name]
            for prop in class_props:
                for doc in class_props[prop]["docs"]:
                    fout.write(f"{doc}\n")
                fout.write("\n")


def stats():
    with open("ground_truth.json", "r") as fin:
        ground_truth = json.load(fin)

    num_classes = len(ground_truth)
    num_props = sum(len(ground_truth[class_name]) for class_name in ground_truth)

    print(f"Number of classes: {num_classes}")
    print(f"Number of properties with refined types: {num_props}")


def replace_doc_with_docs():
    for filepath in glob.glob("sklearn/**/*json", recursive=True):
        with open(filepath, "r") as fin:
            jsonfile = json.load(fin)

        class_name = get_class_name(filepath)
        class_props = jsonfile[class_name]
        for prop in class_props:
            if "doc" in class_props[prop]:
                class_props[prop]["docs"] = class_props[prop].pop("doc")
        with open(filepath, "w") as fout:
            json.dump(jsonfile, fout, indent=4)


if __name__ == "__main__":
    sync()
    stats()
    # extract_docstrings()
