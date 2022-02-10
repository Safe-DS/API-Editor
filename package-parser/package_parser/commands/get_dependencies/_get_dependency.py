from typing import Dict, List, Tuple, Union

import spacy
from spacy.matcher import DependencyMatcher
from spacy.tokens import Token
from spacy.tokens.doc import Doc
from spacy.tokens.span import Span

from ..get_api._model import (
    API,
    Action,
    APIDependencies,
    Condition,
    Dependency,
    Parameter,
    ParameterHasValue,
    ParameterIsIgnored,
    ParameterIsIllegal,
    ParameterIsNone,
)
from ._dependency_patterns import dependency_matcher_patterns
from ._preprocess_docstring import preprocess_docstring

PIPELINE = "en_core_web_sm"


def extract_lefts_and_rights(curr_token: Token, extracted: Union[List, None] = None):
    """
    Given a spaCy token, extract recursively all tokens in its dependency subtree in inorder traversal.
    """
    if extracted is None:
        extracted = []

    token_lefts = list(curr_token.lefts)
    for token in token_lefts:
        extract_lefts_and_rights(token, extracted)

    extracted.append(curr_token.text)

    token_rights = list(curr_token.rights)
    for token in token_rights:
        extract_lefts_and_rights(token, extracted)

    return extracted


def extract_action(action_token: Token, condition_token: Token) -> Action:
    """
    Create action object given head token of action phrase in docstring.
    Condition token used to avoid traversing into the condition phrase dependency subtree of the docstring.
    """
    action_tokens = []
    action_lefts = list(action_token.lefts)
    action_rights = list(action_token.rights)

    for token in action_lefts:
        if token != condition_token:
            action_tokens.extend(extract_lefts_and_rights(token))
    action_tokens.append(action_token.text)
    for token in action_rights:
        if token != condition_token:
            action_tokens.extend(extract_lefts_and_rights(token))

    # Remove trailing punctiation
    if any(p == action_tokens[-1] for p in [",", "."]):
        del action_tokens[-1]
    action_text = " ".join(action_tokens)

    ignored_phrases = [
        "ignored",
        "not used",
        "no impact",
        "only supported",
        "only applies",
    ]
    illegal_phrases = ["raise", "exception", "must be", "must not be"]
    if any(phrase in action_text.lower() for phrase in ignored_phrases):
        return ParameterIsIgnored(action=action_text)
    elif any(phrase in action_text.lower() for phrase in illegal_phrases):
        return ParameterIsIllegal(action=action_text)
    else:
        return Action(action=action_text)


def extract_condition(condition_token: Token) -> Condition:
    """
    Create condition object given head token of condition phrase in docstring.
    """
    condition_token_subtree = list(condition_token.subtree)
    condition_text = " ".join([token.text for token in condition_token_subtree])

    is_none_phrases = [
        "is none",
        "is also none" "is not set",
        "is not specified",
        "is not none",
        "if none",
        "if not none",
    ]
    has_value_phrases = [
        "equals",
        "is true",
        "is false",
        "is set to",
        "is greater than",
        "is less than",
    ]
    if any(phrase in condition_text.lower() for phrase in is_none_phrases):
        return ParameterIsNone(condition=condition_text)
    elif any(phrase in condition_text.lower() for phrase in has_value_phrases):
        return ParameterHasValue(condition=condition_text)
    else:
        return Condition(condition=condition_text)


class DependencyExtractor:
    """
    Functions to extract each type of pattern in _dependency_patterns
    """

    @staticmethod
    def extract_pattern_parameter_adverbial_clause(
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

        condition_token = param_docstring[match[1][1]]
        condition = extract_condition(condition_token)

        action_token = param_docstring[match[1][0]]
        action = extract_action(action_token, condition_token)

        return Dependency(
            hasDependentParameter=dependent_param,
            isDependingOn=is_depending_on_param,
            hasCondition=condition,
            hasAction=action,
        )


def extract_dependencies_from_docstring(
    parameter: Parameter,
    func_parameters: List[Parameter],
    param_docstring: Span,
    matches: List,
    spacy_id_to_pattern_id_mapping: Dict,
) -> List[Dependency]:
    """
    Extract readable dependencies in a Docstring from pattern matches.
    Function fetched from class DependencyExtractor, when 'extract_' + pattern name match function name in the class.
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


def get_dependencies(api: API) -> APIDependencies:
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
            param_dependencies = []
            for sentence in doc.sents:
                sentence_dependency_matches = matcher(sentence)
                sentence_dependencies = extract_dependencies_from_docstring(
                    parameter,
                    parameters,
                    sentence,
                    sentence_dependency_matches,
                    spacy_id_to_pattern_id_mapping,
                )
                if sentence_dependencies:
                    param_dependencies.extend(sentence_dependencies)
            if param_dependencies:
                all_dependencies[function_name][parameter.name] = param_dependencies

    return APIDependencies(dependencies=all_dependencies)
