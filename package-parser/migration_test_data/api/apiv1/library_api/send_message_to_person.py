# apiv2: rename package to notification and use person instead of name and address


def send_message_to_person(name: str, address: str, message: str) -> None:
    """Sends a message to a person

    Parameters
    ----------
    name : str
    address : str
    message : str
    """
    print("To: " + name + "\n" + address + "\n" + message)
