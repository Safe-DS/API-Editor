from typing import Any, Optional

import astroid
from astroid.context import InferenceContext
from package_parser.processing.api.model import Attribute, NamedType, UnionType


def get_instance_attributes(class_node: astroid.ClassDef) -> list[Attribute]:
    attributes = []
    for name, assignments in class_node.instance_attrs.items():
        types = set()
        i = InferenceContext()
        i.lookupname = name
        i.extra_context = class_node.instance_attrs
        for assignment in assignments:
            inferred_nodes = assignment.infer(context=i)
            try:
                for inferred_node in inferred_nodes:
                    attribute_type = _get_type_of_attribute(inferred_node)
                    if attribute_type is not None:
                        types.add(attribute_type)
            except astroid.InferenceError:
                pass

            if isinstance(assignment, astroid.AssignAttr) and isinstance(
                assignment.parent, astroid.Assign
            ):
                attribute_type = _get_type_of_attribute(
                    next(astroid.inference.infer_attribute(self=assignment))
                )
                if attribute_type is not None:
                    types.add(attribute_type)
        if len(types) == 1:
            attributes.append(Attribute(name, NamedType(types.pop())))
        elif len(types) > 1:
            attributes.append(
                Attribute(name, UnionType([NamedType(type_) for type_ in types]))
            )
        else:
            attributes.append(Attribute(name, None))
    return attributes


def _get_type_of_attribute(infered_value: Any) -> Optional[str]:
    if infered_value == astroid.Uninferable:
        return None
    if isinstance(infered_value, astroid.Const) and infered_value.value is None:
        return None
    if isinstance(infered_value, astroid.List):
        return "list"
    if isinstance(infered_value, astroid.Dict):
        return "dict"
    if isinstance(infered_value, astroid.ClassDef):
        return "type"
    if isinstance(infered_value, astroid.Tuple):
        return "tuple"
    if isinstance(infered_value, (astroid.FunctionDef, astroid.Lambda)):
        return "Callable"
    if isinstance(infered_value, astroid.Const):
        return infered_value.value.__class__.__name__
    if isinstance(infered_value, astroid.Instance):
        return infered_value.name
    return None
