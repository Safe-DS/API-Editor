# pylint: disable=duplicate-code
from .persons import Person


def send_message_to_person(person: Person, message: str) -> None:
    print("To: " + person.get_name() + "\n" + person.address + "\n" + message)
