from datetime import datetime, timedelta

from .send_message_to_person import send_message_to_person
from .book import Media, Book
from .persons import Employee, LibraryUser


class Library:
    media: list[Media]  # apiv2: add other media -> change genre
    borrowed_media: list[Media]
    users: list[LibraryUser]
    staff: list[Employee]  # apiv2: add Person subclass to User and Personal and Author
    name: str
    is_open: bool = False

    def __init__(self, media: list[Media], borrowed_media: list[Media], users: list[LibraryUser], staff: list[Employee], name: str, is_open: bool=False) -> None:
        self.media = media
        self.borrowed_media = borrowed_media
        self.users = users
        self.staff = staff
        self.name = name
        self.is_open = is_open

    def open_library(self) -> None:
        self.is_open = True

    def close_library(self) -> None:
        self.is_open = False

    def return_media(self, media: Media, user: LibraryUser) -> None:
        if (
            media.borrow_by is not None
            and Media.borrow_until is not None
            and Media.borrow_by == user
        ):  # apiv2: check if Media is in borrowed Media list
            late_fee = 0.0
            today = datetime.today().date()
            if Media.borrow_until > today or (
                Media.borrow_by == today and not self.is_open
            ):
                late_fee = (today - Media.borrow_until).days * Media.FEE_PER_DAY
                if not self.is_open:
                    late_fee += 1.0
            user.give_back(late_fee)  # apiv2: rename function
            send_message_to_person(user, "You need to pay your late fee.")
            Media.borrow_by = None
            Media.borrow_until = None
            self.borrowed_media.remove(Media)

    def borrow(
        self, media: Media, user: LibraryUser
    ) -> None:  # apiv2: check if pending_fees are not above 5
        if media in self.media and media not in self.borrowed_media and user.pending_fees <= 5.0:
            media.borrow_by = user
            media.borrow_until = datetime.today() + timedelta(days=1)

    def add_new_media(
        self, media: Media
    ) -> None:
        if isinstance(media, Book):
            for element in self.media:
                if isinstance(element, Book) and element.isbn == media.isbn:
                    self.Medias.append(Media)
        else:
            self.Medias.append(Media)
