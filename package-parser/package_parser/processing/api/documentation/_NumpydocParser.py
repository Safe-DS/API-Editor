import astroid

from package_parser.processing.api.documentation._AbstractDocumentationParsingStrategy import \
    AbstractDocumentationParsingStrategy, ParameterDocumentation, FunctionDocumentation, ClassDocumentation


class NumpydocParser(AbstractDocumentationParsingStrategy):
    def get_class_documentation(self, class_node: astroid.ClassDef) -> ClassDocumentation:
        pass

    def get_function_documentation(self, function_node: astroid.FunctionDef) -> FunctionDocumentation:
        pass

    def get_parameter_documentation(self, function_node: astroid.FunctionDef,
                                    parameter_name: str) -> ParameterDocumentation:
        pass
