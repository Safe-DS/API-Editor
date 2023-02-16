# pylint: disable=duplicate-code
# apiv2: merge Bookshelf and Room to one class Position (without max_number_of_items)


class Position:
    """The position is used to point to where a book should be placed

    Parameters
    ----------
    name_of_bookshelf : str
    room_number : int
    floor : int
    """

    name_of_bookshelf: str
    room_number: int
    floor: int

    def __init__(self, name_of_bookshelf: str, room_number: int, floor: int):
        self.name_of_bookshelf = name_of_bookshelf
        self.room_number = room_number
        self.floor = floor

    def get_room_number(self) -> str:
        return str(self.floor) + "." + str(self.room_number)
