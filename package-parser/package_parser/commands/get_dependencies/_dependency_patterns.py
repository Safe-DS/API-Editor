dependency_matcher_patterns = {
    "pattern_parameter_adverbial_clause": [
        {"RIGHT_ID": "action_head", "RIGHT_ATTRS": {"POS": "VERB"}},
        {
            "LEFT_ID": "action_head",
            "REL_OP": ">",
            "RIGHT_ID": "condition_head",
            "RIGHT_ATTRS": {"DEP": "advcl"},
        },
        {
            "LEFT_ID": "condition_head",
            "REL_OP": ">",
            "RIGHT_ID": "dependee_param",
            "RIGHT_ATTRS": {"DEP": {"IN": ["nsubj", "nsubjpass"]}},
        },
    ]
}
