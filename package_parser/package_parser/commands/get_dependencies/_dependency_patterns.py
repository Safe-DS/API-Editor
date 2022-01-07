dependency_matcher_patterns = {
    "pattern_parameter_used_condition": [
        {"RIGHT_ID": "used", "RIGHT_ATTRS": {"ORTH": {"IN": ["used", "Used"]}}},
        {
            "LEFT_ID": "used",
            "REL_OP": ">",
            "RIGHT_ID": "condition",
            "RIGHT_ATTRS": {"DEP": "advcl"},
        },
        {
            "LEFT_ID": "condition",
            "REL_OP": ">",
            "RIGHT_ID": "dependee_param",
            "RIGHT_ATTRS": {"DEP": {"IN": ["nsubj", "nsubjpass"]}},
        },
    ],
    "pattern_parameter_ignored_condition": [
        {
            "RIGHT_ID": "ignored",
            "RIGHT_ATTRS": {"ORTH": {"IN": ["ignored", "Ignored"]}},
        },
        {
            "LEFT_ID": "ignored",
            "REL_OP": ">",
            "RIGHT_ID": "condition",
            "RIGHT_ATTRS": {"DEP": "advcl"},
        },
        {
            "LEFT_ID": "condition",
            "REL_OP": ">",
            "RIGHT_ID": "dependee_param",
            "RIGHT_ATTRS": {"DEP": {"IN": ["nsubj", "nsubjpass"]}},
        },
    ],
    "pattern_parameter_applies_condition": [
        {
            "RIGHT_ID": "applies",
            "RIGHT_ATTRS": {"ORTH": {"IN": ["applies", "Applies"]}},
        },
        {
            "LEFT_ID": "applies",
            "REL_OP": ">",
            "RIGHT_ID": "condition",
            "RIGHT_ATTRS": {"DEP": "advcl"},
        },
        {
            "LEFT_ID": "condition",
            "REL_OP": ">",
            "RIGHT_ID": "dependee_param",
            "RIGHT_ATTRS": {"DEP": {"IN": ["nsubj", "nsubjpass"]}},
        },
    ],
}
