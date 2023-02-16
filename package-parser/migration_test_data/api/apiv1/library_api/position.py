# apiv2: merge Bookshelf and Room to one class Position (without max_number_of_items)


class Bookshelf:
    """A Bookshelf holds multiple books and is used to point to where a book should be placed

    Parameters
    ----------
    name_of_bookshelf : str
    max_number_of_items : int
    """

    name_of_bookshelf: str
    max_number_of_items: int

    def __init__(self, name_of_bookshelf: str, max_number_of_items: int):
        self.max_number_of_items = max_number_of_items
        self.name_of_bookshelf = name_of_bookshelf


class Room:
    """A Room holds multiple bookshelves and is used to point to where a book should be placed

    Parameters
    ----------
    room_number: int
    floor: int
    """

    room_number: int
    floor: int

    def __init__(self, room_number: int, floor: int) -> None:
        self.room_number = room_number
        self.floor = floor

    def get_room_number(self) -> str:
        return str(self.floor) + "." + str(self.room_number)
