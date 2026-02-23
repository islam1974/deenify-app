# Al-Quran Cloud – Copyright & Attribution

This document summarizes copyright and attribution requirements when using **Al-Quran Cloud** (https://alquran.cloud, https://api.alquran.cloud) for **audio**, **translations**, and **Quran fonts** in Deenify.

---

## 1. Official terms (Al-Quran Cloud)

From [alquran.cloud/terms-and-conditions](https://alquran.cloud/terms-and-conditions):

- The **website, API and all services** are provided “in the hope that they will be useful” **without warranty** (no warranty of merchantability or fitness for a particular purpose).
- **Quran text and audio** “has been originally retrieved from **GlobalQuran.com**”.
- **“All audio files used on this website and third party libraries own and retain their respective copyrights.”**

So: Al-Quran Cloud does **not** grant you the copyright in the content; it delivers content that comes from others, and **audio (and third‑party libraries) keep their own copyrights**.

---

## 2. Audio (recitations)

- **Source:** Audio is originally from **GlobalQuran.com**. Al-Quran Cloud also credits:
  - **Mishary Alafasy** – recitation used on the site
  - **Quran Central** – surah audio on the CDN
  - **Every Ayah** – ayah audio on the CDN  
  (See [alquran.cloud/contributors](https://alquran.cloud/contributors).)

- **Copyright:** Per the terms, **“All audio files … own and retain their respective copyrights.”** So reciters and/or their publishers hold rights; Al-Quran Cloud does not license those rights to you.

- **What you should do:**
  - **Attribution:** Credit Al-Quran Cloud and, where possible, the reciters/sources (e.g. “Quran audio via Al-Quran Cloud (alquran.cloud); recitations by [reciter names]. Audio copyright remains with the respective reciters and publishers.”).
  - **Commercial use:** Not granted by Al-Quran Cloud’s terms. For commercial use (paid app, ads, etc.), you need to either get permission from the rights holders or use another source that clearly allows commercial use.

---

## 3. Translations (text)

- **Source:** Al-Quran Cloud states that Quran text (and audio) were “originally retrieved from GlobalQuran.com.” The **translation content** aligns with what is distributed via **Tanzil** (tanzil.net). Al-Quran Cloud credits **Tanzil.net** as “where all the text comes from” ([contributors](https://alquran.cloud/contributors)).

- **Tanzil translation terms** (see [tanzil.net/trans](https://tanzil.net/trans/)):
  - **Non-commercial:** “The translations provided at this page are for **non-commercial purposes only**. If used otherwise, you need to obtain necessary permission from the translator or the publisher.”
  - **More than 3 translations:** “If you are using more than three of the following translations in a website or application, we **require you to put a link back to [this page](https://tanzil.net/trans/)** to make sure that subsequent users have access to the latest updates.”

- **What you should do:**
  - **Attribution:** Credit translation content to Tanzil and Al-Quran Cloud, e.g.  
    “Quran translations delivered via Al-Quran Cloud API; translation content from Tanzil Project (https://tanzil.net/trans/).”
  - **Link:** If you use more than three translations, **add a link to https://tanzil.net/trans/** (e.g. in About / Sources / Credits).
  - **Commercial use:** Tanzil’s terms do **not** allow commercial use of the translations without “necessary permission from the translator or the publisher.” For a commercial app, you need permission or a different, commercial-friendly source.

---

## 4. Quran / Arabic fonts

- **Sources** (from [alquran.cloud/contributors](https://alquran.cloud/contributors)):
  - **Amiri** – Khaled Hosny (Qur’an Unicode text and Amiri font).
  - **Kitab** – Quran Academy (edited Uthmanic Quran text and Kitab font).
  - **Google Early Access Fonts** – also used.

- **Licenses:**
  - **Amiri** – Check current license (often **SIL Open Font License**). You may use and redistribute with attribution and license file.
  - **Kitab** – Check Quran Academy / Kitab font license before bundling or redistributing.
  - **Google Fonts** – Generally free for use; confirm per-font terms.

- **What you should do:**
  - **Attribution:** In your app (e.g. About / Credits), name the fonts and authors, e.g.  
    “Arabic Quran fonts: Amiri (Khaled Hosny), Kitab (Quran Academy), and others as per Al-Quran Cloud contributors (alquran.cloud/contributors).”
  - **If you bundle fonts:** Include each font’s license file and comply with its terms (e.g. OFL for Amiri). Do not modify or sell fonts that prohibit it (e.g. some King Fahd fonts).

---

## 5. Summary table

| Content    | Copyright / terms | Attribution / requirements |
|-----------|--------------------|----------------------------|
| **Audio** | Third parties retain copyright (reciters, publishers). | Credit Al-Quran Cloud and reciters/sources. For commercial use, obtain permission or use another source. |
| **Translations** | Tanzil: **non-commercial only** unless you have translator/publisher permission. | Credit Tanzil + Al-Quran Cloud; if using >3 translations, **link to https://tanzil.net/trans/**. |
| **Fonts** | Per-font (e.g. Amiri OFL, Kitab per Quran Academy). | Credit font authors; if bundling, include license and comply with each font’s terms. |

---

## 6. In-app attribution (suggested text)

You can add a “Sources” or “Credits” section (e.g. in About) along these lines:

- **Quran text & translations:** “Delivered via Al-Quran Cloud API (https://alquran.cloud). Translation content from Tanzil Project (https://tanzil.net/trans/).”
- **Quran audio:** “Audio via Al-Quran Cloud; recitations by the respective reciters. Copyright remains with the reciters and publishers.”
- **Fonts:** “Arabic Quran fonts: Amiri (Khaled Hosny), Kitab (Quran Academy), and others – see alquran.cloud/contributors.”

If you use more than three Tanzil translations, **include a clickable link to https://tanzil.net/trans/** in that section.

---

## 7. References

- [Al-Quran Cloud – Terms and Conditions](https://alquran.cloud/terms-and-conditions)
- [Al-Quran Cloud – Contributors](https://alquran.cloud/contributors)
- [Al-Quran Cloud – API](https://alquran.cloud/api)
- [Tanzil – Quran translations (terms)](https://tanzil.net/trans/)
- [Tanzil – Text license (Arabic text, CC BY 3.0)](https://tanzil.net/docs/Text_License)

*This document is for product and legal awareness only, not legal advice. For commercial use or specific licensing decisions, consult a lawyer.*
