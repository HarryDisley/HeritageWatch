# Standing

Heritage, law and state commitments. Standing is an open-source, educational atlas that connects three things:

- **Sites**: an interactive map and searchable profiles of cultural heritage sites, with transparent, source-backed status classifications (Safe, Moderate Concern, High Concern, Critical Concern) rather than numerical risk scores, plus a Digital Preservation Index.
- **Countries**: what each country's official treaty record shows for the 1954 Hague Convention and its two Protocols, the 1972 World Heritage Convention, and the Rome Statute, with a link to the register for every entry.
- **Casebook**: court cases and international decisions where heritage and law meet, written in plain language, with facts kept separate from attributed interpretation.

Every published claim links to a source. Content is drafted with the help of AI tools, checked against the sources, and approved by the author before it is published. See the Methodology page for the full rules.

Standing is an independent, non-commercial student project. It is not affiliated with, endorsed by, or part of UNESCO, the United Nations, the International Criminal Court, Blue Shield, or any other organization whose records it cites.

Status: in development.

## Run locally

```
npm install
npm run dev
```

Requires a Postgres database. Put its connection strings in a local `.env` file as `DATABASE_URL` and `DIRECT_URL` (never commit this file). Content lives in `research/` as reviewed JSON files and is loaded with `npm run import:dossiers` and `npm run import:countries-cases`.

## License

TBD.
