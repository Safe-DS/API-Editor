import datetime


class Person:
    first_name: str
    last_name: str
    address: str

    def __init__(self, first_name: str, last_name: str, address: str) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.address = address

    def get_name(self) -> str:
        return self.first_name + " " + self.last_name


class LibraryUser(Person):
    id_number: str
    pending_fees: float
    member_until: datetime.date

    def __init__(self, first_name: str, last_name: str, id_number: str, address: str, pending_fees: float, member_until: datetime.date) -> None:
        super().__init__(first_name, last_name, address)
        self.id_number = id_number
        self.pending_fees = pending_fees
        self.member_until = member_until

    def give_back(self, late_fee: float) -> None:
        self.pending_fees = self.pending_fees + late_fee

    def extend_membership(self) -> None:
        self.member_until = self.member_until.replace(year=self.member_until.year+1)

    def pay(self, money: float) -> float:
        if money > self.pending_fees:
            self.pending_fees = 0
            return money - self.pending_fees
        self.pending_fees = self.pending_fees - money
        return 0.0


class Employee(Person):
    wage: float

    def __init__(self, first_name: str, last_name: str, address: str, wage: float) -> None:
        super().__init__(first_name, last_name, address)
        self.wage = wage

