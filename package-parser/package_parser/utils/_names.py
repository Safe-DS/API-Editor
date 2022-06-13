def declaration_qname_to_name(qualified_name: str) -> str:
    return qualified_name.split(".")[-1]


def parent_id(id_: str) -> str:
    return "/".join(id_.split("/")[:-1])


def parent_qualified_name(qualified_name: str) -> str:
    return ".".join(qualified_name.split(".")[:-1])
