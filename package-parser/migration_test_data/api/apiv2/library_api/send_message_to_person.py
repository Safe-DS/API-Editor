from migration_test_data.api.apiv2.library_api.persons import Person


def send_message_to_person(person: Person, message: str) -> None:
    print("To: " + person.get_name() + "\n" + person.address + "\n" + message)
