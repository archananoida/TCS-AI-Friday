"""Small dependency-free example for validating the repository CI pipeline."""


def add(a: int, b: int) -> int:
    """Return the sum of two integers."""
    return a + b


def main() -> None:
    print(f"AI Friday sample: 2 + 3 = {add(2, 3)}")


if __name__ == "__main__":
    main()
