from typing import Dict, List, Tuple, Union

import spacy
from spacy.matcher import DependencyMatcher
from spacy.tokens.doc import Doc

from ..get_api._model import API, Action, Condition, Dependency, Parameter
from ._dependency_patterns import dependency_matcher_patterns
from ._preprocess_docstring import preprocess_docstring

PIPELINE = "en_core_web_sm"


class DependencyExtractor:
    @staticmethod
    def extract_pattern_parameter_used_condition(
        dependent_param: Parameter,
        func_parameters: List[Parameter],
        match: Tuple,
        param_docstring: Doc,
    ) -> Union[Dependency, None]:
        is_depending_on_param_index = match[1][2]
        is_depending_on_param_name = param_docstring[is_depending_on_param_index].text
        is_depending_on_param = next(
            filter(
                lambda param: param.name == is_depending_on_param_name, func_parameters
            ),
            None,
        )
        if is_depending_on_param is None:
            # Likely not a correct dependency match
            return None

        condition_verb = param_docstring[match[1][1]]
        condition_verb_subtree = list(condition_verb.subtree)
        condition_text = " ".join([token.text for token in condition_verb_subtree])
        condition = Condition(condition=condition_text)

        action = Action(action="used")

        return Dependency(
            hasDependentParameter=dependent_param,
            isDependingOn=is_depending_on_param,
            hasCondition=condition,
            hasAction=action,
        )

    @staticmethod
    def extract_pattern_parameter_ignored_condition(
        dependent_param: Parameter,
        func_parameters: List[Parameter],
        match: Tuple,
        param_docstring: Doc,
    ) -> Union[Dependency, None]:
        is_depending_on_param_index = match[1][2]
        is_depending_on_param_name = param_docstring[is_depending_on_param_index].text
        is_depending_on_param = next(
            filter(
                lambda param: param.name == is_depending_on_param_name, func_parameters
            ),
            None,
        )
        if is_depending_on_param is None:
            # Likely not a correct dependency match
            return None

        condition_verb = param_docstring[match[1][1]]
        condition_verb_subtree = list(condition_verb.subtree)
        condition_text = " ".join([token.text for token in condition_verb_subtree])
        condition = Condition(condition=condition_text)

        action = Action(action="ignored")

        return Dependency(
            hasDependentParameter=dependent_param,
            isDependingOn=is_depending_on_param,
            hasCondition=condition,
            hasAction=action,
        )

    @staticmethod
    def extract_pattern_parameter_applies_condition(
        dependent_param: Parameter,
        func_parameters: List[Parameter],
        match: Tuple,
        param_docstring: Doc,
    ) -> Union[Dependency, None]:
        is_depending_on_param_index = match[1][2]
        is_depending_on_param_name = param_docstring[is_depending_on_param_index].text
        is_depending_on_param = next(
            filter(
                lambda param: param.name == is_depending_on_param_name, func_parameters
            ),
            None,
        )
        if is_depending_on_param is None:
            # Likely not a correct dependency match
            return None

        condition_verb = param_docstring[match[1][1]]
        condition_verb_subtree = list(condition_verb.subtree)
        condition_text = " ".join([token.text for token in condition_verb_subtree])
        condition = Condition(condition=condition_text)

        action = Action(action="applies")

        return Dependency(
            hasDependentParameter=dependent_param,
            isDependingOn=is_depending_on_param,
            hasCondition=condition,
            hasAction=action,
        )


def extract_dependencies_from_docstring(
    parameter: Parameter,
    func_parameters: List[Parameter],
    param_docstring: str,
    matches: List,
    spacy_id_to_pattern_id_mapping: Dict,
) -> List[Dependency]:
    """
    Extract readable dependencies in a Docstring from pattern matches
    """
    dependencies = list()
    for match in matches:
        pattern_id = spacy_id_to_pattern_id_mapping[match[0]]
        extract_dependency_method = getattr(
            DependencyExtractor, f"extract_{pattern_id}"
        )
        dependency = extract_dependency_method(
            parameter, func_parameters, match, param_docstring
        )
        if dependency is not None:
            dependencies.append(dependency)
    return dependencies


def get_dependencies(api: API) -> Dict:
    """
    Loop through all functions in the API
    Parse and preprocess each doc string from every function
    Extract and return all dependencies as a dict with function and parameter names as keys
    """
    nlp = spacy.load(PIPELINE)

    matcher = DependencyMatcher(nlp.vocab)
    spacy_id_to_pattern_id_mapping: Dict = dict()
    for pattern_id, pattern in dependency_matcher_patterns.items():
        matcher.add(pattern_id, [pattern])
        spacy_id_to_pattern_id_mapping[nlp.vocab.strings[pattern_id]] = pattern_id
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
                parameter,
                parameters,
                doc,
                dependency_matches,
                spacy_id_to_pattern_id_mapping,
            )
            if param_dependencies:
                all_dependencies[function_name][parameter.name] = param_dependencies

    return all_dependencies
