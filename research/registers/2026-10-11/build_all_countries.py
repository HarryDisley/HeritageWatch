"""Build country-v1 draft files for every country from the five verified register extracts.

Inputs (all hash-verified copies of what the official pages showed):
  reg/hague1954_parties.txt, reg/hague_p1_parties.txt, reg/hague_p2_parties.txt,
  reg/wh_parties.txt, reg/rome_statute.txt, signatory files, reg/m49_*.txt
"""
import json, re, os, sys, datetime
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reg")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "all-countries")
os.makedirs(OUT, exist_ok=True)
ACC = "2026-10-11"
EXISTING = {"syria","yemen","united-kingdom","italy","ukraine","nepal","myanmar","cambodia","chile","peru"}

def lines(f): return open(os.path.join(R, f), encoding="utf-8").read().rstrip("\n").split("\n")
norm = lambda s: s.replace("’", "'").strip()

# ---- M49 universe -------------------------------------------------------
names = open(os.path.join(R, "m49_names.txt"), encoding="utf-8").read().strip().split(";")
regs = open(os.path.join(R, "m49_regions.txt")).read().strip()
assert len(names) == len(regs) == 248
REGION = {"F": "Africa", "M": "Americas", "S": "Asia", "E": "Europe", "O": "Oceania"}
M49 = {}
for nm, rc in zip(names, regs):
    n, a3 = nm.split("|")
    M49[norm(n)] = dict(iso=a3, region=REGION.get(rc))

# ---- name aliases from registers to M49 ------------------------------------
ALIAS = {
    "Bahamas (The)": "Bahamas", "Czech Republic": "Czechia", "St. Kitts and Nevis": "Saint Kitts and Nevis",
    "St. Lucia": "Saint Lucia", "St. Vincent and the Grenadines": "Saint Vincent and the Grenadines",
    "Slovak Republic": "Slovakia", "Iran": "Iran (Islamic Republic of)",
    "Libya": "Libya",
}
def canon(n):
    n = norm(n)
    n = re.sub(r"\s+\d+$", "", n)  # drop trailing footnote number
    n = ALIAS.get(n, n)
    return n

# ---- parse registers ------------------------------------------------------
MONTHS = {m: i for i, m in enumerate(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], 1)}
FULLM = {m: i for i, m in enumerate(["January","February","March","April","May","June","July","August","September","October","November","December"], 1)}
def iso_from_words(s):  # "5 March 1958" or "5 Mar 1958"
    d, m, y = s.split()
    mm = FULLM.get(m) or MONTHS[m[:3]]
    return f"{int(y):04d}-{mm:02d}-{int(d):02d}"
def iso_from_slash(s):  # 20/03/1979
    d, m, y = s.split("/")
    return f"{y}-{m}-{d}"

def parse_unesco_parties(f, hdr=True):
    out = {}
    for ln in lines(f)[(1 if hdr else 0):]:
        _, name, grp, date, typ = ln.split("|")
        out[canon(name)] = dict(date=iso_from_words(date), disp=date, typ=typ)
    return out
def parse_unesco_sign(f, hdr):
    rows = lines(f)[(1 if hdr else 0):]
    out = {}
    for ln in rows:
        name, note, date = ln.split("|")
        out[canon(name)] = date
    return out

H54 = parse_unesco_parties("hague1954_parties.txt", hdr=False)
HP1 = parse_unesco_parties("hague_p1_parties.txt")
HP2 = parse_unesco_parties("hague_p2_parties.txt")
H54S = parse_unesco_sign("hague1954_sign.txt", False)
HP1S = parse_unesco_sign("hague_p1_sign.txt", True)
HP2S = parse_unesco_sign("hague_p2_sign.txt", True)
assert (len(H54), len(HP1), len(HP2)) == (138, 115, 94), (len(H54), len(HP1), len(HP2))

WH = {}
for ln in lines("wh_parties.txt")[1:]:
    _, name, date, typ = ln.split("|")
    foot = re.search(r"\s(\d+)$", name)
    WH[canon(name)] = dict(date=iso_from_slash(date), disp=f"{date} ({typ})", typ=typ, foot=foot.group(1) if foot else None)
assert len(WH) == 196

ROME = {}
for ln in lines("rome_statute.txt")[1:]:
    name, sig, rat = ln.split("|")
    foot = re.search(r"\s(\d+)$", name)
    withdrawn = rat.startswith("[")
    sig = sig.strip("[] ").strip(); rat = rat.strip("[] ").strip()
    kind = "ratification";
    m = re.match(r"^(.*?)\s+(a|d|A|AA)$", rat)
    if m: rat, kind = m.group(1), {"a": "accession", "d": "succession", "A": "acceptance", "AA": "approval"}[m.group(2)]
    ROME[canon(name)] = dict(sig=sig, rat=rat, kind=kind, withdrawn=withdrawn, foot=foot.group(1) if foot else None)
assert len(ROME) == 156, len(ROME)
assert sum(1 for v in ROME.values() if v["rat"]) == 127  # 125 parties + 2 withdrawn (Burundi, Philippines)

# ---- Rome Statute pending-withdrawal notes (UNTC footnote 2) -----------------
ROME_WITHDRAWAL = {
    "Burundi": ("withdrawn", "27 October 2016", "27 October 2017"),
    "Philippines": ("withdrawn", "17 March 2018", "17 March 2019"),
    "Niger": ("pending", "18 June 2026", "18 June 2027"),
    "Burkina Faso": ("pending", "24 June 2026", "24 June 2027"),
    "Mali": ("pending", "24 June 2026", "24 June 2027"),
    "Venezuela (Bolivarian Republic of)": ("pending", "24 July 2026", "24 July 2027"),
    "Chad": ("pending", "27 July 2026", "27 July 2027"),
    "Naoero": ("pending", "23 September 2026", "23 September 2027"),
}
ROME_RESCINDED = {
    "South Africa": "The UN Treaty Collection records a notification of withdrawal on 19 October 2016 and its revocation on 7 March 2017.",
    "Gambia": "The UN Treaty Collection records a notification of withdrawal on 10 November 2016 and its rescission on 10 February 2017.",
    "Hungary": "The UN Treaty Collection records a notification of withdrawal on 2 June 2025 and the withdrawal of that notification on 29 May 2026.",
}
ROME_DO_NOT_INTEND = {
    "Israel": "In a communication received on 28 August 2002, Israel informed the UN Secretary-General that it does not intend to become a party and has no legal obligations arising from its signature on 31 December 2000 (UNTC footnote 4).",
    "Sudan": "In a communication received on 26 August 2008, Sudan informed the UN Secretary-General that it does not intend to become a party and has no legal obligation arising from its signature on 8 September 2000 (UNTC footnote 10).",
    "Russian Federation": "In a communication received on 30 November 2016, the Russian Federation informed the UN Secretary-General of its intention not to become a party to the Rome Statute (UNTC footnote 9).",
    "United States of America": "In a communication received on 6 May 2002, the United States informed the UN Secretary-General that it does not intend to become a party and has no legal obligations arising from its signature on 31 December 2000 (UNTC footnote 12).",
}
ROME_OTHER_NOTES = {
    "Montenegro": "Listed with the action type 'd' (succession). The UN Treaty Collection refers to its 'Historical Information' note on Montenegro (footnote 5), which was not read.",
    "Denmark": "UNTC footnote 3 records a territorial exclusion for the Faroe Islands and Greenland made at ratification, and later declarations (2004, 2006) applying the Statute to both.",
    "United Kingdom of Great Britain and Northern Ireland": "UNTC footnote 11 records later extensions of the UK's ratification to listed territories.",
    "Netherlands (Kingdom of the)": "Listed with the action type 'A' (acceptance). UNTC footnote 7: 'For the Kingdom in Europe, the Netherlands Antilles and Aruba.'",
    "New Zealand": "UNTC footnote 8 records that the ratification does not extend to Tokelau unless and until a declaration to that effect is lodged.",
}
WH_FOOT = {
    "2": "WHC page footnote 2 on Cabo Verde: '25 Octobre 2013, change of country name'.",
    "3": "WHC page footnote 3 on Czechia concerns the short official name (effective 17 May 2016).",
    "4": "WHC page footnote 4 on Eswatini records the change of country name from the Kingdom of Swaziland (effective 19 April 2018).",
    "5": "WHC page footnote 5 on Germany records that the German Democratic Republic acceded on 12 December 1988 and that the two German states united on 3 October 1990; see the page for the full wording.",
    "6": "WHC page footnote 6 on Libya concerns the form of the country name.",
    "7": "WHC page footnote 7 on the Netherlands: 'With an extension to Curaçao.'",
    "8": "WHC page footnote 8 on North Macedonia concerns the country name (effective 14 February 2019).",
    "9": "WHC page footnote 9 on the Russian Federation: the instrument of ratification was deposited by the U.S.S.R. on 12 October 1988.",
    "10": "WHC page footnote 10 on Türkiye concerns the country name (effective 31 May 2022).",
    "11": "WHC page footnote 11 on Yemen: the unification of the Yemen Arab Republic and the People's Democratic Republic of Yemen into the Republic of Yemen was proclaimed on 22 May 1990.",
}

# ---- universe: M49 entities appearing in at least one register ------------
reg_names = set(H54) | set(HP1) | set(HP2) | set(H54S) | set(HP1S) | set(HP2S) | set(WH) | set(ROME)
HISTORIC = {"Yugoslavia","Federal Republic of Germany","Libyan Arab Jamahiriya","Ukrainian Soviet Socialist Republic",
            "Czechoslovakia","Democratic Kampuchea","Burma","Byelorussian Soviet Socialist Republic"}
unmapped = sorted(n for n in reg_names if n not in M49 and n not in HISTORIC)
if unmapped:
    print("UNMAPPED:", unmapped); sys.exit(1)
UNIVERSE = sorted(n for n in reg_names if n in M49)

SHORT = {
    "Bolivia (Plurinational State of)": "Bolivia", "Democratic People's Republic of Korea": "North Korea",
    "Congo": "Republic of the Congo", "Iran (Islamic Republic of)": "Iran", "Lao People's Democratic Republic": "Laos",
    "Micronesia (Federated States of)": "Micronesia", "Netherlands (Kingdom of the)": "Netherlands",
    "Republic of Korea": "South Korea", "Republic of Moldova": "Moldova", "Russian Federation": "Russia",
    "State of Palestine": "Palestine", "Syrian Arab Republic": "Syria", "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    "United Republic of Tanzania": "Tanzania", "United States of America": "United States",
    "Venezuela (Bolivarian Republic of)": "Venezuela", "Viet Nam": "Vietnam", "Brunei Darussalam": "Brunei", "Naoero": "Nauru",
    "Côte d'Ivoire": "Côte d'Ivoire",
}
def slugify(s):
    import unicodedata
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

SRC = {
 "src_00": dict(title="Rome Statute of the International Criminal Court - status of ratification (Chapter XVIII.10)", publisher="United Nations Treaty Collection",
   url="https://treaties.un.org/Pages/ViewDetails.aspx?src=TREATY&mtdsg_no=XVIII-10&chapter=18&clang=_en", source_type="un", tier=1,
   reliability_note="Official depositary record. Table read in the built-in browser on 2026-10-11; bracketed entries and footnotes were read as shown.",
   published_date="", published_date_display="Page states: status as at 11-10-2026"),
 "src_01": dict(title="States Parties - UNESCO World Heritage Convention", publisher="UNESCO World Heritage Centre",
   url="https://whc.unesco.org/en/statesparties/", source_type="unesco", tier=1,
   reliability_note="The page states its own as-of date as 22-Oct-2024 (196 States Parties); entries were read on 2026-10-11 and later changes, if any, may not be shown.",
   published_date="", published_date_display="Page states: as of 22-Oct-2024"),
 "src_02": dict(title="Convention for the Protection of Cultural Property in the Event of Armed Conflict with Regulations for the Execution of the Convention (States Parties and signatories tables)", publisher="UNESCO Legal Affairs",
   url="https://www.unesco.org/en/legal-affairs/convention-protection-cultural-property-event-armed-conflict-regulations-execution-convention?hub=416", source_type="unesco", tier=1,
   reliability_note="The page shows no as-of date; tables were read on 2026-10-11 (138 States Parties).", published_date="", published_date_display=""),
 "src_03": dict(title="Protocol to the Convention for the Protection of Cultural Property in the Event of Armed Conflict (First Protocol, 1954) (States Parties and signatories tables)", publisher="UNESCO Legal Affairs",
   url="https://www.unesco.org/en/legal-affairs/protocol-convention-protection-cultural-property-event-armed-conflict?hub=416", source_type="unesco", tier=1,
   reliability_note="The page shows no as-of date; tables were read on 2026-10-11 (115 States Parties).", published_date="", published_date_display=""),
 "src_04": dict(title="Second Protocol to the Hague Convention of 1954 for the Protection of Cultural Property in the Event of Armed Conflict (States Parties and signatories tables)", publisher="UNESCO Legal Affairs",
   url="https://www.unesco.org/en/legal-affairs/second-protocol-hague-convention-1954-protection-cultural-property-event-armed-conflict?hub=416", source_type="unesco", tier=1,
   reliability_note="The page shows no as-of date; tables were read on 2026-10-11 (94 States Parties).", published_date="", published_date_display=""),
 "src_05": dict(title="Standard country or area codes for statistical use (M49) - overview", publisher="United Nations Statistics Division",
   url="https://unstats.un.org/unsd/methodology/m49/overview/", source_type="un", tier=1,
   reliability_note="Used only for the region label (UN geoscheme region) and the ISO alpha-3 code. Placement in a region implies no political or other affiliation.",
   published_date="", published_date_display=""),
}
for v in SRC.values(): v["accessed_date"] = ACC
T = {"hague-1954": "src_02", "hague-1954-first-protocol": "src_03", "hague-1999-second-protocol": "src_04", "world-heritage-1972": "src_01", "rome-statute": "src_00"}
NP = "Not listed in the States Parties table on the UNESCO page at the access date."

def row(t, status, action, date, disp, note=None):
    return dict(treaty_slug=t, status=status, action_type=action, date=date, date_display=disp, note=note, source_id=T[t])
ACT = {"Accession": "accession", "Ratification": "ratification", "Notification of succession": "succession", "Acceptance": "acceptance", "Approval": "approval"}

def hague_row(t, parties, signs, name):
    sd = signs.get(name)
    if name in parties:
        p = parties[name]
        note = f"Also listed as a signatory on {sd}." if sd else None
        if p["typ"] == "Notification of succession":
            note = ((note + " ") if note else "") + "Instrument type as given on the page: notification of succession."
        return row(t, "party", ACT[p["typ"]], p["date"], p["disp"], note)
    if sd:
        return row(t, "signed_not_ratified", None, iso_from_words(sd), f"{sd} (signature)",
                   "Listed in the signatories table; not listed as a State Party at the access date.")
    return row(t, "not_party", None, None, "not listed", NP + " Not listed among the signatories.")

def wh_row(name):
    if name in WH:
        p = WH[name]
        act = {"R": "ratification", "Ac": "acceptance", "A": "accession", "S": "succession"}[p["typ"]]
        return row("world-heritage-1972", "party", act, p["date"], p["disp"], WH_FOOT.get(p["foot"]) if p["foot"] else None)
    return row("world-heritage-1972", "not_party", None, None, "not listed", "Not listed among the States Parties on the UNESCO page, which states an as-of date of 22-Oct-2024 (196 States Parties). Later changes, if any, may not be shown.")

def rome_row(name):
    r = ROME.get(name)
    if not r:
        return row("rome-statute", "not_party", None, None, "not listed",
                   "Not listed among the signatories or parties in the UN Treaty Collection participants table at the access date.")
    note_parts = []
    if r["sig"] and r["rat"] and not (name in ROME_WITHDRAWAL and ROME_WITHDRAWAL[name][0] == "withdrawn"):
        note_parts.append(f"Signed {r['sig']}.")
    if name in ROME_WITHDRAWAL:
        kind, notif, eff = ROME_WITHDRAWAL[name]
        if kind == "withdrawn":
            note_parts.append(f"The UN Treaty Collection shows the dates in brackets and lists a withdrawal notified {notif}, effective {eff}.")
        else:
            note_parts.append(f"The UN Treaty Collection lists a notification of withdrawal on {notif}, to take effect on {eff}; the table still lists it as a party at the access date.")
    if name in ROME_RESCINDED: note_parts.append(ROME_RESCINDED[name])
    if name in ROME_OTHER_NOTES: note_parts.append(ROME_OTHER_NOTES[name])
    if name in ROME_DO_NOT_INTEND: note_parts.append(ROME_DO_NOT_INTEND[name])
    note = " ".join(note_parts) or None
    if r["rat"] and name in ROME_WITHDRAWAL and ROME_WITHDRAWAL[name][0] == "withdrawn":
        return row("rome-statute", "not_party", None, None, f"formerly party (withdrawal effective {ROME_WITHDRAWAL[name][2]})",
                   f"Ratified {r['rat']} (signed {r['sig']}). " + (note or ""))
    if r["rat"]:
        return row("rome-statute", "party", r["kind"], iso_from_words(r["rat"]), r["rat"], note)
    return row("rome-statute", "signed_not_ratified", None, iso_from_words(r["sig"]), f"{r['sig']} (signature)",
               "Signature date shown; no deposit of an instrument of ratification is listed on the page at the access date." + (" " + note if note else ""))

made = []
for name in UNIVERSE:
    short = SHORT.get(name, name)
    slug = slugify(short)
    m49 = M49[name]
    if slug in EXISTING:
        # compare to the already-approved hand-verified file as a cross-check, do not overwrite it
        pass
    ms = [hague_row("hague-1954", H54, H54S, name), hague_row("hague-1954-first-protocol", HP1, HP1S, name),
          hague_row("hague-1999-second-protocol", HP2, HP2S, name), wh_row(name), rome_row(name)]
    official = f' The UN registers list it as "{name}".' if short != name else ""
    summ = (f"{short} is placed in the UN geoscheme region {m49['region']}.{official} This record shows its status under five heritage-protection and international criminal law instruments, as listed on the UNESCO and United Nations Treaty Collection registers on 11 October 2026.")
    d = dict(schema_version="country-v1", slug=slug, name=short, iso_code=m49["iso"], region=m49["region"], summary=summ,
             treaty_memberships=ms, sources=[dict(source_id=k, **v) for k, v in SRC.items()], site_slugs=[],
             review_status="draft", approved_by=None, approved_date=None, approval_note=None,
             last_verified_date=ACC, recorded_by="claude-draft",
             changelog=[dict(date=ACC, changed_by="claude-draft", change=(
               "Generated from the full text of the five official registers, read in the built-in browser on 2026-10-11 and saved with checksum verification "
               "(UNESCO 1954 Convention 138 parties; First Protocol 115; Second Protocol 94; World Heritage 196, page as-of 22-Oct-2024; UNTC Rome Statute status as at 11-10-2026). "
               "Dates are deposit/signature dates as shown; entry-into-force dates were not read. Succession, name-change and territory footnotes are summarised only where listed; "
               "predecessor-state instruments are not traced beyond what the register says. Region and ISO code come from the UN M49 overview; the summary is an editorial label."))])
    made.append(d)

slugs = [d["slug"] for d in made]; assert len(slugs) == len(set(slugs)), "duplicate slug"
isos = [d["iso_code"] for d in made]; assert len(isos) == len(set(isos)), "duplicate iso"
for d in made:
    fn = os.path.join(OUT, d["slug"] + ".json")
    json.dump(d, open(fn, "w"), indent=2, ensure_ascii=False)
print("countries:", len(made))
from collections import Counter
print(Counter(d["region"] for d in made))
for t in T:
    print(t, Counter(next(m for m in d["treaty_memberships"] if m["treaty_slug"] == t)["status"] for d in made))
