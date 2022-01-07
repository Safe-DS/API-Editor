import re


def preprocess_docstring(docstring: str) -> str:
    """
    1. Remove cluttered punctuation around parameter references
    2. Set '=', ==' to 'equals' and set '!=' to 'does not equal'
    3. Handle cases of step two where the signs are not separate tokens, e.g. "a=b".
    Note ordered dict since "=" is a substring of the other symbols.
    """

    docstring = re.sub(r'["“”`]', "", docstring)
    docstring = re.sub(r"'", "", docstring)
    docstring = re.sub(r"!=", " does not equal ", docstring)
    docstring = re.sub(r"==?", " equals ", docstring)
    docstring = re.sub(r"\s+", " ", docstring)

    return docstring
