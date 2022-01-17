dependency_matcher_patterns = {
    "pattern_parameter_subordinating_conjunction": [
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
    ],
    "pattern_parameter_": [
        {
            "RIGHT_ID": "action",
            "RIGHT_ATTRS": {"POS": "VERB"},  # verb is set as an anchor token
        },
        {
            "LEFT_ID": "action",
            "REL_OP": ">",
            "RIGHT_ID": "ActionParameterName",  # verb is a direct head of subject which is a NOUN i.e. Parameter Name
            "RIGHT_ATTRS": {"DEP": {"IN": ["nsubjpass", "nsubj"]}},
        },
        {
            "LEFT_ID": "action",
            "REL_OP": ">",
            "RIGHT_ID": "ConditionalVerbModifier",  # Verb is restricted by Verb Modifier
            "RIGHT_ATTRS": {"DEP": "advmod"},
        },
        {
            "LEFT_ID": "action",
            "REL_OP": ">>",
            "RIGHT_ID": "ConditionalParameterName",  # verb is a head in chain of object i.e. Parameter name or value
            "RIGHT_ATTRS": {"DEP": {"IN": ["dobj", "pobj"]}},
        },
    ],
}
