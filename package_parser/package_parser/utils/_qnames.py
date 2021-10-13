def declaration_name(qname: str) -> str:
    return qname.split(".")[-1]

def parent_qname(qname: str) -> str:
    return ".".join(qname.split(".")[:-1])
