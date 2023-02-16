# pylint: disable=duplicate-code
from datetime import date, datetime, timedelta

from .media import Book, Media
from .notificate import send_message_to_person
from .persons import Employee, LibraryMember, Person


class Library:
    """The Library

    Parameters
    ----------
    media : list[Media]
    borrowed_media : list[Media]
    users : list[LibraryMember]
    staff : list[Employee]
    name : str
    """

    media: list[Media]  # apiv2: add other media -> change genre
    borrowed_media: list[Media]
    users: list[LibraryMember]
    staff: list[Employee]  # apiv2: add Person subclass to User and Personal and Author
    name: str
    # apiv2: remove is_open attribute

    def __init__(
        self,
        media: list[Media],
        borrowed_media: list[Media],
        users: list[LibraryMember],
        staff: list[Employee],
        name: str,
    ) -> None:
        self.media = media
        self.borrowed_media = borrowed_media
        self.users = users
        self.staff = staff
        self.name = name

    def return_media(self, media: Media, user: LibraryMember) -> None:
        """Return media

        Parameters
        ----------
        media : Media
        user : LibraryMember
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
        self, media: Media, user: LibraryMember
    ) -> None:  # apiv2: check if pending_fees are not above 5
        """borrow

        Parameters
        ----------
        media : Media
        user : LibraryMember
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
        # apiv2: check if book is not duplicated, rename to add_new_media

    def event(self, persons: list[Person]) -> None:
        """host an event with participants

        Parameters
        ----------
        persons : list[Person]
        """
        for person in persons:
            person.participate()


class OurLibrary(Library):
    """Our Library

    Parameters
    ----------
    media : list[Media]
    borrowed_media : list[Media]
    users : list[LibraryMember]
    staff : list[Employee]
    name : str
    """

    owner: Person
    address: str

    def __init__(
        self,
        media: list[Media],
        borrowed_media: list[Media],
        users: list[LibraryMember],
        staff: list[Employee],
        name: str,
        owner: Person,
        address: str,
    ) -> None:
        super().__init__(media, borrowed_media, users, staff, name)
        self.owner = owner
        self.address = address

    def let_seminar_room(
        self, money: float, person: Person, renting_date: date
    ) -> float:  # apiv2: remove rented_date, move to new subclass OurLibrary with additional attributes owner and address
        """rent the seminar room of the library after it closed

        Parameters
        ----------
        money : float
        name : str
        address : str
        renting_date : datetime

        Returns
        -------
        exchanged_money_or_money_to_be_paid : float
        """
        if money >= 50:
            send_message_to_person(
                person,
                f"You rented our seminar room for {money:.2f} € at "
                + str(renting_date),
            )
        return money - 50
