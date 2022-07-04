def pluralize(count: int, word: str) -> str:
    if count == 1:
        return f"{count} {word}"
    else:
        return f"{count} {word}s"
