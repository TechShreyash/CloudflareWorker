# ascii-url-encoder

An ASCII url ecoder and decoder. 

⚠️ The decoder is just
```typescript
decodeURIComponent(str)
```
All that was added is parentesis encoding.

## Installation

```bash
yarn add ascii-url-encoder
```

or

```bash
npm intall ascii-url-encoder
```

## Usage

```typescript
import { encode, decode } from "ascii-url-encoder";

const encodedString = encode("(lorem) ipsum");

const decodedString = decode("%28lorem%29%20ipsum");
```
