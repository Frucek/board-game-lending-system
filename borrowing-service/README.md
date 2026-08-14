## Borrowing Service

Druga mikrostoritev sistema je Borrowing Service.

Skrbi za izposojo in vračilo družabnih iger ter zgodovino izposoj.

### Funkcionalnosti

- izposoja igre
- vračilo igre
- pregled zgodovine izposoj
- pregled posamezne izposoje

### Tehnologije

- Python
- gRPC
- Protocol Buffers
- SQLite
- unittest
- Docker

### gRPC API

#### BorrowGame

Izposoja družabne igre.

#### ReturnGame

Vrne izposojeno igro.

#### GetBorrowingHistory

Vrne zgodovino izposoj uporabnika.

#### GetBorrowing

Vrne podatke o posamezni izposoji.
