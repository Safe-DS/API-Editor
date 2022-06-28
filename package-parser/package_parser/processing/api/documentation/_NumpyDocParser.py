import re

import astroid
import numpydoc.docscrape
from numpydoc.docscrape import NumpyDocString

from ._AbstractDocumentationParser import AbstractDocumentationParser, ParameterDocumentation, \
    FunctionDocumentation, ClassDocumentation
from ._get_full_docstring import get_full_docstring


class NumpyDocParser(AbstractDocumentationParser):
    def get_class_documentation(self, class_node: astroid.ClassDef) -> ClassDocumentation:
        docstring = get_full_docstring(class_node)

        return ClassDocumentation(
            description=_get_description(docstring),
            full_docstring=docstring
        )

    def get_function_documentation(self, function_node: astroid.FunctionDef) -> FunctionDocumentation:
        docstring = get_full_docstring(function_node)

        return FunctionDocumentation(
            description=_get_description(docstring),
            full_docstring=docstring
        )

    def get_parameter_documentation(
        self,
        function_node: astroid.FunctionDef,
        parameter_name: str
    ) -> ParameterDocumentation:

        # For constructors (__init__ functions) the parameters are described on the class
        if function_node.name == "__init__" and isinstance(function_node.parent, astroid.ClassDef):
            docstring = get_full_docstring(function_node.parent)
        else:
            docstring = get_full_docstring(function_node)

        # Find matching parameter docstrings. Numpydoc allows multiple parameters to be documented at once. See
        # https://numpydoc.readthedocs.io/en/latest/format.html#parameters for more information.
        function_numpydoc = NumpyDocString(docstring)
        all_parameters_numpydoc: list[numpydoc.docscrape.Parameter] = function_numpydoc.get("Parameters", [])
        matching_parameters_numpydoc = [
            it for it in all_parameters_numpydoc
            if _is_matching_parameter_numpydoc(it, parameter_name)
        ]

        if len(matching_parameters_numpydoc) == 0:
            return ParameterDocumentation(
                type="",
                default_value="",
                description=""
            )

        last_parameter_numpydoc = matching_parameters_numpydoc[-1]
        type, default_value = _get_type_and_default_value(last_parameter_numpydoc)
        return ParameterDocumentation(
            type=type,
            default_value=default_value,
            description="\n".join([line.strip() for line in last_parameter_numpydoc.desc])
        )


def _get_description(docstring: str) -> str:
    """
    Returns the concatenated summary and extended summary parts of the given docstring or an empty string if these parts
    are blank.
    """

    numpydoc_ = NumpyDocString(docstring)
    summary: list[str] = numpydoc_.get("Summary", [])
    extended_summary: list[str] = numpydoc_.get("Extended Summary", [])

    result = ""
    result += "\n".join([line.strip() for line in summary])
    result += "\n\n"
    result += "\n".join([line.strip() for line in extended_summary])
    return result.strip()


def _is_matching_parameter_numpydoc(parameter_numpydoc: numpydoc.docscrape.Parameter, parameter_name: str) -> bool:
    """
    Returns whether the given NumpyDoc applied to the parameter with the given name.
    """

    return any(name.strip() == parameter_name for name in parameter_numpydoc.name.split(","))


def _get_type_and_default_value(parameter_numpydoc: numpydoc.docscrape.Parameter) -> (str, str):
    """
    Returns the type and default value for the given NumpyDoc.
    """

    type_ = parameter_numpydoc.type
    parts = re.split(r",\s*optional|,\s*default\s*[:=]?", type_)

    if len(parts) != 2:
        return type_.strip(), ""

    return parts[0].strip(), parts[1].strip()
