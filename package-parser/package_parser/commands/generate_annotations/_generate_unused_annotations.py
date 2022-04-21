import json
import re
from typing import Dict, List, Tuple


def generate_unused_annotations(in_file_path: str):
    """
    Returns a Dict of unused functions or classes

    :param in_file_path: JSON file that contains a list of unused functions or classes
    """

    with open(in_file_path, "r", encoding="UTF-8") as in_file:
        data = json.load(in_file)

    unuseds: Dict[str, Dict[str, str]] = {}
    for name in data:
        formatted_name = format_name(name)
        unuseds[formatted_name] = {"target": formatted_name}

    return unuseds


def format_name(name: str):
    if name is None:
        return None

    parts = re.split("\\.", name)
    newname = "sklearn/" + parts[0]

    if len(parts) == 1:
        return newname

    slash = False
    for part in parts[1:-1]:
        if not slash and re.match("^_{0,2}[A-Z]", part):
            slash = True
        if slash:
            newname += "/" + part
        else:
            newname += "." + part

    newname += "/" + parts[-1]
    return newname
