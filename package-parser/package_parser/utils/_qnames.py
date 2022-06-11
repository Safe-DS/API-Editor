def declaration_qname_to_name(qname: str) -> str:
    return qname.split(".")[-1]


def parent_id(id_: str) -> str:
    return "/".join(id_.split("/")[:-1])
