dependency_matcher_patterns = {
    "dependency_action_if_param_is_val": [
        {"RIGHT_ID": "action", "RIGHT_ATTRS": {"POS": "VERB"}},
        {
            "LEFT_ID": "action",
            "REL_OP": ">",
            "RIGHT_ID": "condition",
            "RIGHT_ATTRS": {"DEP": "advcl"},
        },
        {
            "LEFT_ID": "condition",
            "REL_OP": ">",
            "RIGHT_ID": "condition_param",
            "RIGHT_ATTRS": {"DEP": "nsubj"},
        },
        {
            "LEFT_ID": "condition",
            "REL_OP": ">",
            "RIGHT_ID": "condition_bool",
            "RIGHT_ATTRS": {"DEP": {"IN": ["attr", "acomp", "dobj"]}},
        },
    ]
}
