# pylint: disable=duplicate-code
from datetime import datetime, timedelta

from .media import Book, Media
from .persons import Employee, LibraryUser, Person
from .send_message_to_person import send_message_to_person


class Library:
    """The Library

    Parameters
    ----------
    media : list[Media]
    borrowed_media : list[Media]
    users : list[LiberyUser]
    staff : list[Emplyee]
    name : str
    """
    media: list[Media]  # apiv2: add other media -> change genre
    borrowed_media: list[Media]
    users: list[LibraryUser]
    staff: list[Employee]  # apiv2: add Person subclass to User and Personal and Author
    name: str
    # is_open: bool = False  # apiv2: remove attribute

    def __init__(
        self,
        media: list[Media],
        borrowed_media: list[Media],
        users: list[LibraryUser],
        staff: list[Employee],
        name: str,
    ) -> None:
        self.media = media
        self.borrowed_media = borrowed_media
        self.users = users
        self.staff = staff
        self.name = name

    def return_media(self, media: Media, user: LibraryUser) -> None:
        """Return media

         Parameters
         ----------
         media : Media
         user : LibraryUser
        """
        if (
            media.borrow_by is not None
            and media.borrow_until is not None
            and media.borrow_by == user
        ):  # apiv2: check if Media is in borrowed Media list
            late_fee = 0.0
            today = datetime.today().date()
            if media.borrow_until > today:
                late_fee = (today - media.borrow_until).days * media.FEE_PER_DAY
            user.give_back(late_fee)  # apiv2: rename function
            send_message_to_person(user, "You need to pay your late fee.")
            media.borrow_by = None
            media.borrow_until = None
            self.borrowed_media.remove(media)

    def borrow(
        self, media: Media, user: LibraryUser
    ) -> None:  # apiv2: check if pending_fees are not above 5
        """borrow

        Parameters
        ----------
        media : Media
        user : LibraryUser
        """
        if (
            media in self.media
            and media not in self.borrowed_media
            and user.pending_fees <= 5.0
        ):
            media.borrow_by = user
            media.borrow_until = datetime.today() + timedelta(days=1)

    def add_new_media(self, media: Media) -> None:
        """add a new media

        Parameters
        ----------
        media : Media
        """
        if isinstance(media, Book):
            for element in self.media:
                if isinstance(element, Book) and element.isbn == media.isbn:
                    self.media.append(media)
        else:
            self.media.append(media)

    def event(self, persons: list[Person]) -> None:
        """host an event with participants

        Parameters
        ----------
        persons : list[Person]
        """
        for person in persons:
            person.participate()
