# Quran Translation – Copyright & Licensing

## Summary

**Deenify uses only fawazahmed0/quran-api for Quran text.** There are no references to Al Quran Cloud, Tanzil, or any other Quran text/translation API in the app’s runtime code or in-app credits. All Arabic and translation verse content is loaded from fawazahmed0’s CDN (Unlicense — safe for commercial and non-commercial use). Chapter names/metadata use the app’s built-in list.

### Quran audio (reciters)

**Source:** Audio files are streamed from **everyayah.com** (e.g. Alafasy, Husary, Abdul Basit Mujawwad, and others). The app credits everyayah.com in the About screen and links to the site.

**Copyright / commercial use:** everyayah.com does **not** publish formal terms of use, licence, or commercial-use policy on its site. The recordings are of named reciters (e.g. Mishary Rashid Alafasy, Mahmoud Khalil Al-Husary, Abdul Basit Abdus Samad); rights in those recordings typically belong to the reciters or their publishers. Hosting them on a public site does not, by itself, grant redistribution or commercial rights.

- **Non-commercial / personal use:** Commonly accepted in the community when the source is credited, but not formally documented by everyayah.
- **Commercial use:** Uncertain. For paid apps, ads, or other commercial use, consider (1) contacting everyayah.com and/or the reciters’ representatives for permission, or (2) using another audio source that clearly permits commercial use, or (3) taking legal advice.

The app lists reciters by name in settings and credits “Quran audio recitations: everyayah.com” (with link) in About. That supports good faith attribution but does not substitute for a clear licence or permission where required.

---

The section below describes the *previous* setup (Al Quran Cloud + Tanzil) for **text only** and is kept only as historical/legal context. It does not apply to the current app.

---

## Tanzil (main upstream source)

Al Quran Cloud’s translation data aligns with what’s distributed via **[Tanzil](https://tanzil.net/trans/)**. Tanzil’s [Terms of Use](https://tanzil.net/trans/) say:

1. **Non‑commercial use**  
   *“The translations provided at this page are for non-commercial purposes only. If used otherwise, you need to obtain necessary permission from the translator or the publisher.”*

2. **When using more than 3 translations**  
   *“If you are using more than three of the following translations in a website or application, we require you to put a link back to [this page](http://tanzil.net/trans/) to make sure that subsequent users have access to the latest updates.”*  
   Deenify offers many more than three translations, so this link is **required**.

3. **Redistribution of the translation list**  
   Redistributing Tanzil’s full list of translations on another site is not allowed unless the Tanzil Project gives direct permission.

---

## Arabic Quran text

The **Arabic Quran text** (Uthmani script etc.) is a separate matter:

- **Tanzil Quran text** is under [Creative Commons Attribution 3.0 (CC BY 3.0)](https://tanzil.net/docs/Text_License), with attribution and a link to tanzil.net for updates.
- Al Quran Cloud states that Quran text (and audio) were “originally retrieved from GlobalQuran.com.”
- Many uses of the raw Qur’an text are treated as public domain; the **translations** are the part that are clearly under translator/publisher and Tanzil terms.

---

## What to do in Deenify

1. **Attribution in the app (About / acknowledgments)**  
   - Keep crediting “Al Quran Cloud API” for the **delivery** of text/translations.  
   - Add explicit credit for **translation content** and link to Tanzil, e.g.:
     - “Quran translations: via Al Quran Cloud API; translation content from Tanzil Project (https://tanzil.net/trans/).”
   - That satisfies Tanzil’s requirement to “put a link back to this page” when using more than three of their listed translations.

2. **Commercial use**  
   - If Deenify is **non‑commercial** (free, no ads, no in‑app purchases, no subscription): using the translations under Tanzil’s “non-commercial” clause is consistent with their terms, **as long as** you provide the Tanzil attribution and link above.
   - If Deenify is **commercial** (paid app, ads, IAP, subscriptions, etc.): Tanzil’s terms say you need “necessary permission from the translator or the publisher” for each translation you use. In that case you should:
     - Either obtain permission from the relevant translators/publishers for the translations you ship, or  
     - Restrict the app to translations that are explicitly licensed for commercial use (e.g. some open/permissive licences or direct agreements), and document which those are.

3. **Per‑translation rights**  
   - Some older translations (e.g. certain Pickthall, Yusuf Ali) may be in the public domain in some jurisdictions; many others are still under copyright.  
   - Relying on “public domain” or “fair use” for a given translation is a legal assessment that depends on jurisdiction and use. For safety, treat Tanzil’s non‑commercial + attribution requirements as the baseline, and seek permission or use clearly commercial‑friendly sources if you monetise.

---

## If you might go commercial — which API is safest?

Below is a short comparison of Quran translation APIs from a *“might be commercial later”* perspective. “Safest” here means: no explicit “non-commercial only” or “commercial requires a separate agreement” in the API/service terms.

| API / Source | License / terms | Commercial use |
|--------------|------------------|----------------|
| **Al Quran Cloud** (current) | Content from Tanzil / GlobalQuran; “third party retain copyright.” | Tanzil: **non‑commercial only** unless you get permission from translator/publisher. **Risky** if you monetise. |
| **Quran Foundation / Quran.com API** | [Developer terms](https://api-docs.quran.foundation/legal/developer-terms/): display in-app OK; “any other form of commercial redistribution or use of QF Content or raw API data requires a **separate written commercial license agreement**.” | **Risky** for commercial use unless you sign that agreement. |
| **The-Quran-Project Quran-API** | MIT for the *code*; data is “taken from Quran.com.” | Same content as Quran.com → same **commercial restrictions** as above. **Not safer** for commercial. |
| **fawazahmed0/quran-api** | **Unlicense** (public domain) on the **entire repo** (code + data). No “non-commercial” or “commercial forbidden” in the license. 90+ languages, 400+ translations, no rate limits. Base URL: `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/...` — see [docs](https://quranapi.pages.dev/), [GitHub](https://github.com/fawazahmed0/quran-api). | **Least restrictive** of the options checked: license does not prohibit commercial use. Maintainer asks to credit and to support translation authors where possible ([References](https://github.com/fawazahmed0/quran-api/blob/1/References.md)). Individual translation copyright may still exist; the *repo* is released into the public domain. |

**Practical recommendation if you plan to monetise later:**  
- **Safest bet among these:** **fawazahmed0/quran-api** — Unlicense, no “commercial forbidden,” widely used.  
- **Current setup (Al Quran Cloud + Tanzil):** Fine for a free, non‑commercial app with proper attribution; **not** safe for commercial use without permission or a different content source.  
- **Quran.com / Quran Foundation:** Only safe for commercial use if you get their **written commercial license**.

Switching to fawazahmed0 would require changing `QuranService` base URL and response parsing to match their [API structure](https://quranapi.pages.dev/getting-started) (e.g. editions by name, chapter/verse paths).

---

## References

- [everyayah.com](https://www.everyayah.com/) – Quran recitation audio (no formal terms of use published)
- [Al Quran Cloud – Terms and Conditions](https://alquran.cloud/terms-and-conditions)
- [Tanzil – Quran Translations (terms and list)](https://tanzil.net/trans/)
- [Tanzil – Text License (Arabic Quran text, CC BY 3.0)](https://tanzil.net/docs/Text_License)
- [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) – Unlicense, [docs](https://quranapi.pages.dev/)
- [Quran Foundation Developer Terms](https://api-docs.quran.foundation/legal/developer-terms/)

---

*This note is for product and legal awareness only, not legal advice. For decisions about commercial use or specific translations, consult a lawyer.*
