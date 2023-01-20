from typing import Any, Optional

import astroid
from astroid.context import InferenceContext
from astroid.nodes import Name, Subscript
from package_parser.processing.api.model import Attribute, NamedType, UnionType


def get_instance_attributes(class_node: astroid.ClassDef) -> list[Attribute]:
    attributes = []
    for name, assignments in class_node.instance_attrs.items():
        types = set()
        remove_types = {None}
        inference_context = InferenceContext()
        inference_context.lookupname = name
        inference_context.extra_context = class_node.instance_attrs
        for assignment in assignments:
            inferred_nodes = assignment.infer(context=inference_context)
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
                elif (
                    isinstance(assignment.parent.value, Name)
                    and isinstance(assignment.parent.parent, astroid.FunctionDef)
                    and assignment.parent.parent.name == "__init__"
                ):
                    init_function = assignment.parent.parent
                    parameter_name = assignment.parent.value.name
                    for arg in init_function.args.args:
                        i = init_function.args.args.index(arg)
                        if (
                            isinstance(
                                init_function.args.args[i],
                                (astroid.nodes.node_classes.AssignName, Name),
                            )
                            and init_function.args.args[i].name == parameter_name
                        ):
                            type_hint = init_function.args.annotations[i]
                            if type_hint is not None:
                                if isinstance(type_hint, Name):
                                    types.add(type_hint.name)
                                elif isinstance(type_hint, astroid.Attribute):
                                    types.add(type_hint.attrname)
                                elif (
                                    isinstance(type_hint, Subscript)
                                    and isinstance(type_hint.value, Name)
                                    and isinstance(type_hint.slice, Name)
                                ):
                                    value = type_hint.value.name
                                    slice_name = type_hint.slice.name
                                    if value == "Optional":
                                        types.add("NoneType")
                                        types.add(slice_name)
                                    else:
                                        types.add(value + "[" + slice_name + "]")
                                        remove_types.add(value)
                                        remove_types.add(value.lower())
                                elif (
                                    isinstance(type_hint, Subscript)
                                    and isinstance(type_hint.value, Name)
                                    and isinstance(type_hint.slice, astroid.Tuple)
                                    and type_hint.value.name == "Union"
                                ):
                                    for type_name in type_hint.slice.elts:
                                        if isinstance(type_name, Name):
                                            types.add(type_name.name)
                                    remove_types.add(type_hint.value.name)
                                    remove_types.add(type_hint.value.name.lower())
                            break
        types = types - remove_types
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
