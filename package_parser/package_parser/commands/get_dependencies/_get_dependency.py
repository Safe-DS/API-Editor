from typing import Dict, List

import spacy
from spacy.matcher import DependencyMatcher

from ..get_api._model import API
from ._dependency_patterns import dependency_matcher_patterns
from ._preprocess_docstring import preprocess_docstring

PIPELINE = "en_core_web_sm"


def extract_dependencies_from_docstring(docstring: str, matches: List):
    """
    Extract readable dependencies in a Docstring from pattern matches
    """
    pass


def get_dependencies(api: API) -> Dict:
    """
    Loop through all functions in the API
    Parse and preprocess each doc string from every function
    Extract and return all dependencies as a dict with function and parameter names as keys
    """
    nlp = spacy.load(PIPELINE)

    matcher = DependencyMatcher(nlp.vocab)
    for id, pattern in dependency_matcher_patterns.items():
        matcher.add(id, [pattern])

    all_dependencies: Dict = dict()
    endpoint_functions = api.functions

    for function_name, function in endpoint_functions.items():
        parameters = function.parameters
        all_dependencies[function_name] = {}

        for parameter in parameters:
            docstring = parameter.docstring.description
            docstring_preprocessed = preprocess_docstring(docstring)
            doc = nlp(docstring_preprocessed)
            dependency_matches = matcher(doc)
            param_dependencies = extract_dependencies_from_docstring(
                doc, dependency_matches
            )
            all_dependencies[function_name][parameter.name] = param_dependencies

    return all_dependencies
