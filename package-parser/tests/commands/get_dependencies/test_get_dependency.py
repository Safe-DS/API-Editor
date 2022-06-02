import spacy
from package_parser.model.api import (
    Action,
    Condition,
    Dependency,
    Parameter,
    ParameterAndResultDocstring,
    ParameterAssignment,
    ParameterHasValue,
    ParameterIsIgnored,
    ParameterIsIllegal,
    ParameterIsNone,
)
from package_parser.processing.dependencies import (
    DependencyExtractor,
    extract_action,
    extract_condition,
    extract_lefts_and_rights,
)

nlp = spacy.load("en_core_web_sm")


def test_extract_lefts_and_rights():
    # string from https://spacy.io/usage/linguistic-features#navigating
    doc = nlp("Autonomous cars shift insurance liability toward manufacturers")
    doc_head_token = doc[2]
    extracted_lefts_and_rights = extract_lefts_and_rights(doc_head_token)
    assert extracted_lefts_and_rights == doc.text.split()


def test_extract_action():
    action_is_ignored = nlp(
        "this parameter is ignored when fit_intercept is set to False."
    )
    action_is_ignored_action_token = action_is_ignored[3]
    action_is_ignored_condition_token = action_is_ignored[7]

    ignored_action = extract_action(
        action_is_ignored_action_token, action_is_ignored_condition_token
    )
    assert ignored_action == ParameterIsIgnored(action="this parameter is ignored")

    action_is_illegal = nlp(
        "Individual weights for each sample raises error if sample_weight is passed and base_estimator fit method does not support it. "
    )
    action_is_illegal_action_token = action_is_illegal[5]
    action_is_illegal_condition_token = action_is_illegal[10]

    illegal_action = extract_action(
        action_is_illegal_action_token, action_is_illegal_condition_token
    )
    assert illegal_action == ParameterIsIllegal(
        action="Individual weights for each sample raises error"
    )

    action_uncategorised = nlp(
        "If metric is precomputed, X is assumed to be a kernel matrix."
    )
    action_uncategorised_action_token = action_uncategorised[7]
    action_uncategorised_condition_token = action_uncategorised[3]

    action = extract_action(
        action_uncategorised_action_token, action_uncategorised_condition_token
    )
    assert action == Action(action=", X is assumed to be a kernel matrix")


def test_extract_condition():
    condition_is_none = nlp(
        "If func is None , then func will be the identity function."
    )
    condition_is_none_root_token = condition_is_none[2]

    is_none_condition = extract_condition(condition_is_none_root_token)
    assert is_none_condition == ParameterIsNone(condition="If func is None")

    condition_has_value = nlp(
        "this parameter is ignored when fit_intercept is set to False."
    )
    condition_has_value_root_token = condition_has_value[7]

    has_value_condition = extract_condition(condition_has_value_root_token)
    assert has_value_condition == ParameterHasValue(
        condition="when fit_intercept is set to False"
    )

    condition_uncategorised = nlp(
        "If metric is a string, it must be one of the metrics in pairwise."
    )
    condition_uncategorised_root_token = condition_uncategorised[2]

    condition = extract_condition(condition_uncategorised_root_token)
    assert condition == Condition(condition="If metric is a string")


def test_extract_dependencies_from_docstring_pattern_adverbial_clause():
    param_docstring_nlp = nlp("ignored when probability is False")
    dependent_param = Parameter(
        name="random_state",
        qname="sklearn.linear_model.LogisticRegression.random_state",
        pname="sklearn/sklearn.linear_model/LogisticRegression/random_state",
        default_value=None,
        is_public=True,
        assigned_by=ParameterAssignment.NAME_ONLY,
        docstring=ParameterAndResultDocstring(
            type="param possible types", description=param_docstring_nlp.text
        ),
    )
    dependee_param = Parameter(
        name="probability",
        qname="sklearn.linear_model.LogisticRegression.probability",
        pname="sklearn/sklearn.linear_model/LogisticRegression/probability",
        default_value=None,
        is_public=True,
        assigned_by=ParameterAssignment.NAME_ONLY,
        docstring=ParameterAndResultDocstring(
            type="param possible types", description="param probability docstring"
        ),
    )
    pattern_parameter_subordinating_conjunction = nlp(
        "ignored when probability is False"
    )
    func_params = [dependent_param, dependee_param]
    match = (314159265, [0, 3, 2])

    expected_dependency = Dependency(
        hasDependentParameter=dependent_param,
        isDependingOn=dependee_param,
        hasCondition=ParameterHasValue("when probability is False"),
        hasAction=ParameterIsIgnored("ignored"),
    )

    extracted_dependency = (
        DependencyExtractor.extract_pattern_parameter_adverbial_clause(
            dependent_param=dependent_param,
            func_parameters=func_params,
            match=match,
            param_docstring=param_docstring_nlp,
        )
    )

    assert expected_dependency == extracted_dependency
