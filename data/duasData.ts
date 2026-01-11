export interface DuaSubcategory {
  name: string;
  examples: string[];
}

export interface DuaCategory {
  category: string;
  subcategories: DuaSubcategory[];
}

export interface Dua {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  category: string;
  subcategory: string;
  times?: string;
  reference?: string;
}

export const duaCategories: DuaCategory[] = [
  {
    category: "Daily Duas",
    subcategories: [
      { name: "Morning & Evening", examples: ["Dua for waking up", "Dua for evening protection"] },
      { name: "Before Sleeping & Waking", examples: ["Dua before sleeping", "Dua after waking"] },
      { name: "Eating & Drinking", examples: ["Dua before eating", "Dua after eating", "Dua before drinking milk"] },
      { name: "Entering/Leaving House", examples: ["Dua when entering home", "Dua when leaving home"] },
      { name: "Using Restroom", examples: ["Dua before entering", "Dua after leaving"] }
    ]
  },
  {
    category: "Worship (ʿIbādah)",
    subcategories: [
      { name: "Salah", examples: ["Dua in sujood", "Dua after tashahhud"] },
      { name: "After Salah", examples: ["Dua for dhikr after prayer"] },
      { name: "Wudu", examples: ["Dua before wudu", "Dua after wudu"] },
      { name: "Masjid", examples: ["Dua when entering masjid", "Dua when leaving masjid"] },
      { name: "Quran Recitation", examples: ["Dua before reciting", "Dua after completing"] }
    ]
  },
  {
    category: "Travel & Safety",
    subcategories: [
      { name: "Before Journey", examples: ["Dua when starting travel"] },
      { name: "Riding Vehicle", examples: ["Dua for riding transport"] },
      { name: "During Travel", examples: ["Protection while traveling"] },
      { name: "New Places", examples: ["Entering a new town"] },
      { name: "Returning", examples: ["Dua upon returning home"] }
    ]
  },
  {
    category: "Health & Protection",
    subcategories: [
      { name: "Healing & Sickness", examples: ["Dua for shifa (healing)"] },
      { name: "Harm & Evil", examples: ["Dua for protection from calamities"] },
      { name: "Protection from Shaytaan", examples: ["Dua when angry", "Dua before sleeping"] },
      { name: "Ruqyah", examples: ["Surah Al-Falaq", "Surah An-Naas"] }
    ]
  },
  {
    category: "Forgiveness & Repentance",
    subcategories: [
      { name: "Seeking Forgiveness", examples: ["Sayyidul Istighfar"] },
      { name: "Protection from Sins", examples: ["Dua for steadfastness"] },
      { name: "Repentance (Tawbah)", examples: ["Dua of Prophet Yunus (AS)"] }
    ]
  },
  {
    category: "Rizq (Sustenance)",
    subcategories: [
      { name: "Barakah in Wealth", examples: ["Dua for blessings in rizq"] },
      { name: "Halal Income", examples: ["Dua for lawful provision"] },
      { name: "Removing Debt", examples: ["Dua for relief from debt"] }
    ]
  },
  {
    category: "Family & Relationships",
    subcategories: [
      { name: "Parents", examples: ["Dua for mercy on parents"] },
      { name: "Children", examples: ["Dua for righteous offspring"] },
      { name: "Spouse", examples: ["Dua for love & harmony"] },
      { name: "Strengthening Ties", examples: ["Dua for unity"] }
    ]
  },
  {
    category: "Special Situations",
    subcategories: [
      { name: "Hardship & Distress", examples: ["Dua of Yunus (AS)"] },
      { name: "Anger", examples: ["Dua when angry"] },
      { name: "Fear/Sadness", examples: ["Dua for removing fear"] },
      { name: "Debt & Worries", examples: ["Dua for relief from worries"] }
    ]
  },
  {
    category: "Death & Afterlife",
    subcategories: [
      { name: "Deceased", examples: ["Dua for forgiveness of the dead"] },
      { name: "Visiting Graves", examples: ["Dua for visiting graveyards"] },
      { name: "Good Ending", examples: ["Dua for husn al-khatimah"] }
    ]
  },
  {
    category: "General Goodness",
    subcategories: [
      { name: "Guidance", examples: ["Dua for steadfastness on deen"] },
      { name: "Knowledge & Wisdom", examples: ["Dua for knowledge increase"] },
      { name: "Patience & Gratitude", examples: ["Dua for sabr & shukr"] },
      { name: "Success (Dunya & Akhirah)", examples: ["Dua for both worlds"] }
    ]
  },
  {
    category: "Mosques & Adhan",
    subcategories: [
      { name: "Entering & Leaving Mosque", examples: ["Dua when entering masjid"] },
      { name: "After Adhan", examples: ["Dua after hearing the call to prayer"] },
      { name: "In the Mosque", examples: ["Duas while in the masjid"] }
    ]
  },
  {
    category: "Hajj & Umrah",
    subcategories: [
      { name: "Talbiyah & Ihram", examples: ["Labbayk Allahumma Labbayk"] },
      { name: "Tawaf", examples: ["Duas during circumambulation"] },
      { name: "Sa'i", examples: ["Between Safa and Marwa"] },
      { name: "At Sacred Sites", examples: ["Arafat, Muzdalifah, Mina"] }
    ]
  },
  {
    category: "Ramadan",
    subcategories: [
      { name: "Fasting", examples: ["Intention for fasting, breaking fast"] },
      { name: "Iftar & Suhoor", examples: ["Dua when breaking fast"] },
      { name: "Laylatul Qadr", examples: ["The Night of Power"] },
      { name: "Special Ramadan Duas", examples: ["Taraweeh, seeking forgiveness"] }
    ]
  },
  {
    category: "Jumu'ah (Friday)",
    subcategories: [
      { name: "Friday Blessings", examples: ["Salawat on the Prophet"] },
      { name: "Before Jumu'ah", examples: ["Preparation for Friday prayer"] },
      { name: "During Jumu'ah", examples: ["The blessed hour"] },
      { name: "After Jumu'ah", examples: ["Gratitude and completion"] }
    ]
  },
  {
    category: "40 Rabbana Duas",
    subcategories: [
      { name: "Quranic Supplications", examples: ["Rabbana duas from the Quran"] }
    ]
  }
];

export const duas: Dua[] = [
  // Daily Duas - Morning & Evening
  {
    id: 1,
    title: 'Morning Dua',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Asbahna wa asbahal mulku lillah, wal hamdu lillah, la ilaha illa Allah wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay\'in qadeer',
    translation: 'We have reached the morning and the kingdom belongs to Allah, and praise be to Allah. There is no god but Allah alone, with no partner. To Him belongs the kingdom and to Him belongs praise, and He is over all things competent.',
    category: 'Daily Duas',
    subcategory: 'Morning & Evening',
    times: 'Morning',
    reference: 'Muslim 4/2088'
  },
  {
    id: 2,
    title: 'Evening Dua',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Amsayna wa amsal mulku lillah, wal hamdu lillah, la ilaha illa Allah wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay\'in qadeer',
    translation: 'We have reached the evening and the kingdom belongs to Allah, and praise be to Allah. There is no god but Allah alone, with no partner. To Him belongs the kingdom and to Him belongs praise, and He is over all things competent.',
    category: 'Daily Duas',
    subcategory: 'Morning & Evening',
    times: 'Evening',
    reference: 'Muslim 4/2088'
  },

  // Daily Duas - Before Sleeping & Waking
  {
    id: 3,
    title: 'Before Sleeping',
    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
    transliteration: 'Bismika rabbi wada\'tu janbi, wa bika arfa\'uhu, fa in amsakta nafsi farhamha, wa in arsaltaha fahfazha bima tahfazu bihi ibadaka as-salihin',
    translation: 'In Your name, my Lord, I lie down, and in Your name I rise. If You should take my soul, then have mercy upon it, and if You should return my soul, then protect it as You protect Your righteous servants.',
    category: 'Daily Duas',
    subcategory: 'Before Sleeping & Waking',
    times: 'Before sleeping',
    reference: 'Bukhari 11/126'
  },
  {
    id: 4,
    title: 'After Waking Up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: 'Alhamdulillahi alladhi ahyana ba\'da ma amatana wa ilayhi an-nushur',
    translation: 'Praise be to Allah who has given us life after having taken it from us and unto Him is the resurrection.',
    category: 'Daily Duas',
    subcategory: 'Before Sleeping & Waking',
    times: 'After waking',
    reference: 'Bukhari 11/120'
  },

  // Daily Duas - Eating & Drinking
  {
    id: 5,
    title: 'Before Eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah',
    category: 'Daily Duas',
    subcategory: 'Eating & Drinking',
    times: 'Before meals',
    reference: 'Bukhari 7/88'
  },
  {
    id: 6,
    title: 'After Eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    transliteration: 'Alhamdulillahi alladhi at\'amana wa saqana wa ja\'alana muslimeen',
    translation: 'Praise be to Allah who has fed us and given us drink and made us Muslims.',
    category: 'Daily Duas',
    subcategory: 'Eating & Drinking',
    times: 'After meals',
    reference: 'Abu Dawud 4/324'
  },
  {
    id: 7,
    title: 'Before Drinking Milk',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ',
    transliteration: 'Allahumma barik lana fihi wa zidna minhu',
    translation: 'O Allah, bless it for us and give us more of it.',
    category: 'Daily Duas',
    subcategory: 'Eating & Drinking',
    times: 'Before drinking milk',
    reference: 'Tirmidhi 4/300'
  },

  // Daily Duas - Entering/Leaving House
  {
    id: 8,
    title: 'Entering Home',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration: 'Bismillahi walajna, wa bismillahi kharajna, wa ala rabbina tawakkalna',
    translation: 'In the name of Allah we enter, and in the name of Allah we leave, and upon our Lord we depend.',
    category: 'Daily Duas',
    subcategory: 'Entering/Leaving House',
    times: 'When entering home',
    reference: 'Abu Dawud 4/325'
  },
  {
    id: 9,
    title: 'Leaving Home',
    arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Bismillah, tawakkaltu ala Allah, la hawla wa la quwwata illa billah',
    translation: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
    category: 'Daily Duas',
    subcategory: 'Entering/Leaving House',
    times: 'When leaving home',
    reference: 'Tirmidhi 5/490'
  },

  // Daily Duas - Using Restroom
  {
    id: 10,
    title: 'Before Entering Restroom',
    arabic: 'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: 'Bismillah, Allahumma inni a\'udhu bika min al-khubuthi wal khaba\'ith',
    translation: 'In the name of Allah. O Allah, I seek refuge in You from the male and female devils.',
    category: 'Daily Duas',
    subcategory: 'Using Restroom',
    times: 'Before entering',
    reference: 'Bukhari 1/45'
  },
  {
    id: 11,
    title: 'After Leaving Restroom',
    arabic: 'غُفْرَانَكَ',
    transliteration: 'Ghufranak',
    translation: 'I seek Your forgiveness.',
    category: 'Daily Duas',
    subcategory: 'Using Restroom',
    times: 'After leaving',
    reference: 'Abu Dawud 1/30'
  },

  // Worship - Salah
  {
    id: 12,
    title: 'Dua in Sujood',
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    transliteration: 'Subhana rabbiyal a\'la',
    translation: 'Glory be to my Lord, the Most High',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Salah',
    times: 'During prostration',
    reference: 'Muslim 1/350'
  },
  {
    id: 13,
    title: 'Dua After Tashahhud',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
    transliteration: 'Allahumma inni a\'udhu bika min adhabil qabr, wa min adhabi jahannam, wa min fitnatil mahya wal mamati, wa min sharri fitnatil masihid dajjal',
    translation: 'O Allah, I seek refuge in You from the punishment of the grave, and from the punishment of Hell, and from the trials of life and death, and from the evil of the trial of the False Messiah.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Salah',
    times: 'After tashahhud',
    reference: 'Bukhari 1/137'
  },
  {
    id: 14,
    title: 'Dua in Ruku',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    transliteration: 'Subhana rabbiyal azim',
    translation: 'Glory be to my Lord, the Most Great',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Salah',
    times: 'During bowing',
    reference: 'Muslim 1/350'
  },

  // Worship - After Salah
  {
    id: 15,
    title: 'Dhikr After Salah',
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ',
    transliteration: 'Subhan Allah, wal hamdu lillah, wallahu akbar',
    translation: 'Glory be to Allah, and praise be to Allah, and Allah is the Greatest.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'After Salah',
    times: 'After prayer',
    reference: 'Muslim 1/418'
  },
  {
    id: 16,
    title: 'Istighfar After Salah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah, astaghfirullah, astaghfirullah',
    translation: 'I seek forgiveness from Allah, I seek forgiveness from Allah, I seek forgiveness from Allah.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'After Salah',
    times: 'After prayer',
    reference: 'Abu Dawud 1/151'
  },

  // Worship - Wudu
  {
    id: 17,
    title: 'Before Wudu',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Wudu',
    times: 'Before ablution',
    reference: 'Abu Dawud 1/20'
  },
  {
    id: 18,
    title: 'After Wudu',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration: 'Ashhadu an la ilaha illa Allah wahdahu la sharika lah, wa ashhadu anna Muhammadan abduhu wa rasuluh',
    translation: 'I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad is His servant and messenger.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Wudu',
    times: 'After ablution',
    reference: 'Muslim 1/209'
  },

  // Worship - Quran Recitation
  {
    id: 19,
    title: 'Before Reciting Quran',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: 'A\'udhu billahi minash shaytanir rajeem',
    translation: 'I seek refuge in Allah from Satan, the accursed.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Quran Recitation',
    times: 'Before reciting',
    reference: 'Quran 16:98'
  },
  {
    id: 20,
    title: 'After Completing Quran',
    arabic: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً',
    transliteration: 'Allahumma irhamni bil qur\'an wa j\'alhu li imaman wa nuran wa hudan wa rahmatan',
    translation: 'O Allah, have mercy on me through the Quran and make it a leader, light, guidance, and mercy for me.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Quran Recitation',
    times: 'After completing',
    reference: 'General supplication'
  },

  // Worship - Masjid
  {
    id: 21,
    title: 'Entering Masjid',
    arabic: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Bismillah, wassalatu wassalamu ala rasulillah, Allahumma aftah li abwaba rahmatik',
    translation: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the doors of Your mercy.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Masjid',
    times: 'When entering',
    reference: 'Muslim 1/494'
  },
  {
    id: 22,
    title: 'Leaving Masjid',
    arabic: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Bismillah, wassalatu wassalamu ala rasulillah, Allahumma inni as\'aluka min fadhlik',
    translation: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask You from Your bounty.',
    category: 'Worship (ʿIbādah)',
    subcategory: 'Masjid',
    times: 'When leaving',
    reference: 'Muslim 1/494'
  },

  // Travel & Safety - Before Journey
  {
    id: 23,
    title: 'Before Travel',
    arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى',
    transliteration: 'Allahumma inni nas\'aluka fi safarina hadha al-birra wat-taqwa wa min al-amali ma tardha',
    translation: 'O Allah, we ask You for righteousness and piety in this journey of ours, and for deeds that will please You.',
    category: 'Travel & Safety',
    subcategory: 'Before Journey',
    times: 'Before traveling',
    reference: 'Muslim 2/986'
  },
  {
    id: 24,
    title: 'Supplication for Travel',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: 'Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun',
    translation: 'Glory be to Him who has subjected this to us, and we were not able to do it. And indeed, to our Lord we will return.',
    category: 'Travel & Safety',
    subcategory: 'Before Journey',
    times: 'When starting travel',
    reference: 'Quran 43:13-14'
  },

  // Travel & Safety - Riding Vehicle
  {
    id: 25,
    title: 'Riding Transport',
    arabic: 'بِسْمِ اللَّهِ، الْحَمْدُ لِلَّهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
    transliteration: 'Bismillah, alhamdulillah, subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin',
    translation: 'In the name of Allah, praise be to Allah. Glory be to Him who has subjected this to us, and we were not able to do it.',
    category: 'Travel & Safety',
    subcategory: 'Riding Vehicle',
    times: 'When riding',
    reference: 'Quran 43:13'
  },

  // Travel & Safety - Returning
  {
    id: 26,
    title: 'Upon Returning Home',
    arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
    transliteration: 'A\'ibuna ta\'ibuna abiduna li rabbina hamidun',
    translation: 'We return, repentant, worshipping our Lord, praising.',
    category: 'Travel & Safety',
    subcategory: 'Returning',
    times: 'Upon returning',
    reference: 'Muslim 2/986'
  },

  // Travel & Safety - New Places
  {
    id: 60,
    title: 'Entering a New Place',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ أَهْلِهَا وَخَيْرَ مَا فِيهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا',
    transliteration: 'Allahumma inni as\'aluka khayraha wa khayra ahliha wa khayra ma fiha, wa a\'udhu bika min sharriha wa sharri ahliha wa sharri ma fiha',
    translation: 'O Allah, I ask You for its goodness, the goodness of its people, and the goodness of what is in it. And I seek refuge in You from its evil, the evil of its people, and the evil of what is in it.',
    category: 'Travel & Safety',
    subcategory: 'New Places',
    times: 'When entering a new town',
    reference: 'Nasa\'i 8/268'
  },

  // Special Situations - Hardship & Distress
  {
    id: 62,
    title: 'Dua in Times of Distress',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    transliteration: 'La ilaha illallah al-azim al-halim, la ilaha illallah rabbu al-arsh al-azim, la ilaha illallah rabbu as-samawati wa rabbu al-ard wa rabbu al-arsh al-karim',
    translation: 'There is no god but Allah, the Most Great, the Most Forbearing. There is no god but Allah, Lord of the Mighty Throne. There is no god but Allah, Lord of the heavens and Lord of the earth and Lord of the Noble Throne.',
    category: 'Special Situations',
    subcategory: 'Hardship & Distress',
    times: 'During times of difficulty',
    reference: 'Bukhari 7/154'
  },
  {
    id: 63,
    title: 'Relief from Anxiety',
    arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي وَنُورَ صَدْرِي وَجَلَاءَ حُزْنِي وَذَهَابَ هَمِّي',
    transliteration: 'Allahumma inni abduka ibnu abdika ibnu amatik, nasiyati biyadik, madin fiyya hukmuk, adlun fiyya qada\'uk, as\'aluka bikulli ismin huwa lak sammayta bihi nafsak an taj\'ala al-Qur\'ana rabi\'a qalbi wa nura sadri wa jala\'a huzni wa dhahaba hammi',
    translation: 'O Allah, I am Your servant, son of Your servant, son of Your maidservant. My forelock is in Your hand. Your command over me is forever executed and Your decree over me is just. I ask You by every name belonging to You which You have named Yourself with, to make the Quran the life of my heart and the light of my breast, and a departure for my sorrow and a release for my anxiety.',
    category: 'Special Situations',
    subcategory: 'Hardship & Distress',
    times: 'When feeling worried or anxious',
    reference: 'Ahmad 1/391'
  },
  {
    id: 64,
    title: 'When Feeling Sad',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration: 'Allahumma inni a\'udhu bika min al-hammi wal-hazan, wal-ajzi wal-kasal, wal-bukhli wal-jubn, wa dla\'i ad-dayni wa ghalabati ar-rijal',
    translation: 'O Allah, I seek refuge in You from worry and sadness, from weakness and laziness, from miserliness and cowardice, from being overcome by debt and from being overpowered by men.',
    category: 'Special Situations',
    subcategory: 'Fear/Sadness',
    times: 'When feeling sad or worried',
    reference: 'Bukhari 7/158'
  },

  // Health & Protection - Healing & Sickness
  {
    id: 27,
    title: 'Dua for Healing',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، وَاشْفِ، أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
    transliteration: 'Allahumma rabban nas, adhhibil ba\'s, washfi, anta ash-shafi, la shifa\'a illa shifa\'uk, shifa\'an la yughadiru saqaman',
    translation: 'O Allah, Lord of mankind, remove the harm and heal, for You are the Healer. There is no healing except Your healing, a healing that leaves no illness.',
    category: 'Health & Protection',
    subcategory: 'Healing & Sickness',
    times: 'When sick',
    reference: 'Bukhari 7/219'
  },
  {
    id: 28,
    title: 'Dua for Sick Person',
    arabic: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ',
    transliteration: 'La ba\'s, tahurun in sha\' Allah',
    translation: 'No harm, it is a purification, Allah willing.',
    category: 'Health & Protection',
    subcategory: 'Healing & Sickness',
    times: 'When visiting sick',
    reference: 'Bukhari 7/219'
  },

  // Health & Protection - Harm & Evil
  {
    id: 29,
    title: 'Protection from Calamities',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَهْدِ الْبَلَاءِ، وَدَرَكِ الشَّقَاءِ، وَسُوءِ الْقَضَاءِ، وَشَمَاتَةِ الْأَعْدَاءِ',
    transliteration: 'Allahumma inni a\'udhu bika min jahdi al-bala\'i, wa daraki ash-shaqa\'i, wa su\'i al-qada\'i, wa shamati al-a\'da\'i',
    translation: 'O Allah, I seek refuge in You from the severity of calamity, from falling into misery, from bad destiny, and from the gloating of enemies.',
    category: 'Health & Protection',
    subcategory: 'Harm & Evil',
    times: 'For protection',
    reference: 'Bukhari 7/150'
  },

  // Health & Protection - Protection from Shaytaan
  {
    id: 30,
    title: 'When Angry',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: 'A\'udhu billahi minash shaytanir rajeem',
    translation: 'I seek refuge in Allah from Satan, the accursed.',
    category: 'Health & Protection',
    subcategory: 'Protection from Shaytaan',
    times: 'When angry',
    reference: 'Bukhari 7/76'
  },
  {
    id: 31,
    title: 'Before Sleeping Protection',
    arabic: 'اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا',
    transliteration: 'Allahumma khalaqta nafsi wa anta tawaffaha, laka mamatuha wa mahyaha, in ahyaytaha fahfazha, wa in amattaha faghfir laha',
    translation: 'O Allah, You created my soul and You take it, to You belongs its death and its life. If You give it life, protect it, and if You cause it to die, forgive it.',
    category: 'Health & Protection',
    subcategory: 'Protection from Shaytaan',
    times: 'Before sleeping',
    reference: 'Muslim 4/2083'
  },

  // Health & Protection - Ruqyah
  {
    id: 32,
    title: 'Ayat al-Kursi',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allahu la ilaha illa huwa al-hayyul qayyum, la ta\'khudhuhu sinatun wa la nawm, lahu ma fi as-samawati wa ma fi al-ard, man dha alladhi yashfa\'u indahu illa bi idhnih, ya\'lamu ma bayna aydeehim wa ma khalfahum, wa la yuheetuna bi shay\'in min ilmihi illa bi ma sha\'a, wasi\'a kursiyyuhu as-samawati wa al-ard, wa la ya\'uduhu hifzuhuma, wa huwa al-aliyyu al-azim',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    category: 'Health & Protection',
    subcategory: 'Ruqyah',
    times: 'Before sleeping',
    reference: 'Quran 2:255'
  },
  {
    id: 33,
    title: 'Surah Al-Falaq',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِنْ شَرِّ مَا خَلَقَ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: 'Qul a\'udhu bi rabbi al-falaq min sharri ma khalaq wa min sharri ghasiqin idha waqab wa min sharri an-naffathati fi al-uqad wa min sharri hasidin idha hasad',
    translation: 'Say, "I seek refuge in the Lord of daybreak from the evil of that which He created and from the evil of darkness when it settles and from the evil of the blowers in knots and from the evil of an envier when he envies."',
    category: 'Health & Protection',
    subcategory: 'Ruqyah',
    times: 'For protection',
    reference: 'Quran 113:1-5'
  },
  {
    id: 34,
    title: 'Surah An-Naas',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَهِ النَّاسِ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: 'Qul a\'udhu bi rabbi an-nas maliki an-nas ilahi an-nas min sharri al-waswasi al-khannas alladhi yuwaswisu fi suduri an-nas min al-jinnati wa an-nas',
    translation: 'Say, "I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer who whispers [evil] into the breasts of mankind from among the jinn and mankind."',
    category: 'Health & Protection',
    subcategory: 'Ruqyah',
    times: 'For protection',
    reference: 'Quran 114:1-6'
  },

  // Forgiveness & Repentance - Seeking Forgiveness
  {
    id: 35,
    title: 'Sayyidul Istighfar',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: 'Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduka, wa ana ala ahdika wa wa\'dika ma istata\'tu, a\'udhu bika min sharri ma sana\'tu, abu\'u laka bini\'matika alayya wa abu\'u laka bidhanbi, faghfir li fa innahu la yaghfiru adh-dhunuba illa anta',
    translation: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I am faithful to my covenant and promise to You as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for indeed no one forgives sins except You.',
    category: 'Forgiveness & Repentance',
    subcategory: 'Seeking Forgiveness',
    times: 'Morning and evening',
    reference: 'Bukhari 8/150'
  },
  {
    id: 36,
    title: 'Istighfar (General)',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullah al-azim alladhi la ilaha illa huwa al-hayyul qayyum wa atubu ilayh',
    translation: 'I seek forgiveness from Allah, the Most Great, there is no god but He, the Ever-Living, the Sustainer of existence, and I repent to Him.',
    category: 'Forgiveness & Repentance',
    subcategory: 'Seeking Forgiveness',
    times: 'Any time',
    reference: 'General supplication'
  },

  // Forgiveness & Repentance - Protection from Sins
  {
    id: 37,
    title: 'Dua for Steadfastness',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
    transliteration: 'Rabban la tuzigh qulubana ba\'da idh hadaytana wa hab lana min ladunka rahmatan innaka anta al-wahhab',
    translation: 'Our Lord, do not let our hearts deviate after You have guided us. Grant us Your mercy. Indeed, You are the Bestower.',
    category: 'Forgiveness & Repentance',
    subcategory: 'Protection from Sins',
    times: 'For guidance',
    reference: 'Quran 3:8'
  },

  // Forgiveness & Repentance - Repentance (Tawbah)
  {
    id: 38,
    title: 'Dua of Prophet Yunus (AS)',
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu min adh-dhalimeen',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    category: 'Forgiveness & Repentance',
    subcategory: 'Repentance (Tawbah)',
    times: 'During hardship',
    reference: 'Quran 21:87'
  },

  // Rizq (Sustenance) - Barakah in Wealth
  {
    id: 39,
    title: 'Dua for Barakah in Rizq',
    arabic: 'اللَّهُمَّ بَارِكْ لِي فِي رِزْقِي',
    transliteration: 'Allahumma barik li fi rizqi',
    translation: 'O Allah, bless me in my provision.',
    category: 'Rizq (Sustenance)',
    subcategory: 'Barakah in Wealth',
    times: 'When seeking blessings',
    reference: 'General supplication'
  },
  {
    id: 40,
    title: 'Dua for Increase in Rizq',
    arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    transliteration: 'Allahumma kfini bi halalika an haramik wa aghnini bi fadhlika amman siwak',
    translation: 'O Allah, suffice me with what You have made lawful instead of what You have made unlawful, and make me independent of all others besides You.',
    category: 'Rizq (Sustenance)',
    subcategory: 'Barakah in Wealth',
    times: 'For lawful provision',
    reference: 'Tirmidhi 5/356'
  },

  // Rizq (Sustenance) - Halal Income
  {
    id: 41,
    title: 'Dua for Halal Income',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
    transliteration: 'Allahumma inni as\'aluka ilman nafi\'an wa rizqan tayyiban wa amalan mutaqabbalan',
    translation: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
    category: 'Rizq (Sustenance)',
    subcategory: 'Halal Income',
    times: 'For lawful provision',
    reference: 'Ibn Majah 1/925'
  },

  // Rizq (Sustenance) - Removing Debt
  {
    id: 42,
    title: 'Dua for Relief from Debt',
    arabic: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    transliteration: 'Allahumma kfini bi halalika an haramik wa aghnini bi fadhlika amman siwak',
    translation: 'O Allah, suffice me with what You have made lawful instead of what You have made unlawful, and make me independent of all others besides You.',
    category: 'Rizq (Sustenance)',
    subcategory: 'Removing Debt',
    times: 'For relief from debt',
    reference: 'Tirmidhi 5/356'
  },

  // Family & Relationships - Parents
  {
    id: 43,
    title: 'Dua for Parents',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi irhamhuma kama rabbayani saghira',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    category: 'Family & Relationships',
    subcategory: 'Parents',
    times: 'Any time',
    reference: 'Quran 17:24'
  },

  // Family - Children
  {
    id: 44,
    title: 'Dua for Righteous Children',
    arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ',
    transliteration: 'Rabbi hab li min as-salihin',
    translation: 'My Lord, grant me from among the righteous.',
    category: 'Family & Relationships',
    subcategory: 'Children',
    times: 'When praying for children',
    reference: 'Quran 37:100'
  },

  // Family - Spouse
  {
    id: 45,
    title: 'Dua for Spouse',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a\'yunin waj\'alna lil muttaqeena imama',
    translation: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us a leader for the righteous.',
    category: 'Family & Relationships',
    subcategory: 'Spouse',
    times: 'For family harmony',
    reference: 'Quran 25:74'
  },

  // General Goodness - Knowledge
  {
    id: 46,
    title: 'Dua for Knowledge',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma',
    translation: 'My Lord, increase me in knowledge.',
    category: 'General Goodness',
    subcategory: 'Knowledge & Wisdom',
    times: 'When seeking knowledge',
    reference: 'Quran 20:114'
  },

  // General Goodness - Success
  {
    id: 47,
    title: 'Dua for Success in Both Worlds',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar',
    translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
    category: 'General Goodness',
    subcategory: 'Success (Dunya & Akhirah)',
    times: 'Any time',
    reference: 'Quran 2:201'
  },

  // Death & Afterlife - Deceased
  {
    id: 48,
    title: 'Dua for the Deceased',
    arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ',
    transliteration: 'Allahumma ighfir lahu warhamhu wa \'afihi wa\'fu anhu',
    translation: 'O Allah, forgive him, have mercy on him, grant him well-being, and pardon him.',
    category: 'Death & Afterlife',
    subcategory: 'Deceased',
    times: 'For the deceased',
    reference: 'Muslim 2/634'
  },
  {
    id: 49,
    title: 'Dua for Deceased (Extended)',
    arabic: 'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا، اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ',
    transliteration: 'Allahumma ighfir li hayyina wa mayyitina wa shahidina wa gha\'ibina wa sagheerina wa kabeerina wa dhakarina wa unthana, Allahumma man ahyaytahu minna fa ahyihi ala al-Islam wa man tawaffaytahu minna fa tawaffahu ala al-iman',
    translation: 'O Allah, forgive our living and our dead, those who are present and those who are absent, our young and our old, our males and our females. O Allah, whoever You keep alive, keep him alive in Islam, and whoever You cause to die, cause him to die in faith.',
    category: 'Death & Afterlife',
    subcategory: 'Deceased',
    times: 'At funeral prayer',
    reference: 'Abu Dawud 3/211'
  },
  {
    id: 50,
    title: 'When Someone Passes Away',
    arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَاخْلُفْ لِي خَيْرًا مِنْهَا',
    transliteration: 'Inna lillahi wa inna ilayhi raji\'un, Allahumma ujurni fi museebati wakhluf li khayran minha',
    translation: 'Indeed we belong to Allah, and indeed to Him we will return. O Allah, reward me in my affliction and replace it for me with something better.',
    category: 'Death & Afterlife',
    subcategory: 'Deceased',
    times: 'When receiving news of death',
    reference: 'Muslim 2/632'
  },
  {
    id: 51,
    title: 'Dua for Deceased Parents',
    arabic: 'اللَّهُمَّ اغْفِرْ لَهُمَا وَارْحَمْهُمَا وَعَافِهِمَا وَاعْفُ عَنْهُمَا وَأَكْرِمْ نُزُلَهُمَا وَوَسِّعْ مُدْخَلَهُمَا وَاغْسِلْهُمَا بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ',
    transliteration: 'Allahumma ighfir lahuma warhamhuma wa \'afihima wa\'fu anhuma wa akrim nuzulahuma wa wassi\' mudkhalahuma waghsilhuma bil-ma\'i wa ath-thalji wal-barad',
    translation: 'O Allah, forgive them, have mercy on them, grant them well-being, pardon them, honor their reception, expand their entrance, and wash them with water, snow, and hail.',
    category: 'Death & Afterlife',
    subcategory: 'Deceased',
    times: 'For deceased parents',
    reference: 'Muslim 2/663'
  },

  // Death & Afterlife - Visiting Graves
  {
    id: 52,
    title: 'Entering the Graveyard',
    arabic: 'السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
    transliteration: 'As-salamu alaykum ahla ad-diyari min al-mu\'mineena wal-muslimeena, wa inna in sha\' Allah bikum lahiqun, nas\'alu Allah lana wa lakum al-\'afiyah',
    translation: 'Peace be upon you, O inhabitants of the dwellings, believers and Muslims. Indeed, if Allah wills, we will join you. We ask Allah for well-being for us and for you.',
    category: 'Death & Afterlife',
    subcategory: 'Visiting Graves',
    times: 'When entering graveyard',
    reference: 'Muslim 2/671'
  },
  {
    id: 53,
    title: 'At the Grave',
    arabic: 'السَّلَامُ عَلَى أَهْلِ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَيَرْحَمُ اللَّهُ الْمُسْتَقْدِمِينَ مِنَّا وَالْمُسْتَأْخِرِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ',
    transliteration: 'As-salamu ala ahli ad-diyari min al-mu\'mineena wal-muslimeena, wa yarhamullah al-mustaqdimeena minna wal-musta\'khireena, wa inna in sha\' Allah bikum lahiqun',
    translation: 'Peace be upon the inhabitants of the dwellings from the believers and Muslims. May Allah have mercy on those who have gone ahead of us and those who come later. Indeed, if Allah wills, we will join you.',
    category: 'Death & Afterlife',
    subcategory: 'Visiting Graves',
    times: 'While visiting graves',
    reference: 'Muslim 2/671'
  },
  {
    id: 54,
    title: 'Visiting Graves (Short)',
    arabic: 'السَّلَامُ عَلَيْكُمْ دَارَ قَوْمٍ مُؤْمِنِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ',
    transliteration: 'As-salamu alaykum dara qawmin mu\'mineen, wa inna in sha\' Allah bikum lahiqun',
    translation: 'Peace be upon you, dwelling of believing people, and indeed, if Allah wills, we will join you.',
    category: 'Death & Afterlife',
    subcategory: 'Visiting Graves',
    times: 'When visiting graves',
    reference: 'Muslim 2/671'
  },

  // Death & Afterlife - Good Ending
  {
    id: 55,
    title: 'Dua for Good Ending',
    arabic: 'اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الْأُمُورِ كُلِّهَا وَأَجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الْآخِرَةِ',
    transliteration: 'Allahumma ahsin aqibatana fil umuri kulliha wa ajirna min khizyi ad-dunya wa adhabi al-akhirah',
    translation: 'O Allah, grant us a good ending in all our affairs, and protect us from disgrace in this world and punishment in the Hereafter.',
    category: 'Death & Afterlife',
    subcategory: 'Good Ending',
    times: 'For a good ending',
    reference: 'Ahmad 4/181'
  },
  {
    id: 56,
    title: 'Dua for Husn al-Khatimah',
    arabic: 'اللَّهُمَّ حَسِّنْ خَاتِمَتَنَا وَخَتِّمْ بِالصَّالِحَاتِ أَعْمَالَنَا',
    transliteration: 'Allahumma hassin khatimatana wa khatim bis-salihati a\'malana',
    translation: 'O Allah, make our ending beautiful and seal our deeds with righteous actions.',
    category: 'Death & Afterlife',
    subcategory: 'Good Ending',
    times: 'For a good ending',
    reference: 'General supplication'
  },
  {
    id: 57,
    title: 'When Closing Eyes of Deceased',
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ (اسم الميت) وَارْفَعْ دَرَجَتَهُ فِي الْمَهْدِيِّينَ، وَاخْلُفْهُ فِي عَقِبِهِ فِي الْغَابِرِينَ، وَاغْفِرْ لَنَا وَلَهُ يَا رَبَّ الْعَالَمِينَ، وَافْسَحْ لَهُ فِي قَبْرِهِ وَنَوِّرْ لَهُ فِيهِ',
    transliteration: 'Allahumma ighfir li (name) warfa\' darajatahu fil mahdiyeen, wakhlufhu fi aqibihi fil ghabireen, waghfir lana wa lahu ya rabbal alameen, wafsah lahu fi qabrihi wa nawwir lahu fih',
    translation: 'O Allah, forgive [name of deceased], raise his rank among those who are rightly guided, grant him a successor among his descendants, and forgive us and him, O Lord of the Worlds. Widen his grave for him and illuminate it for him.',
    category: 'Death & Afterlife',
    subcategory: 'Deceased',
    times: 'When closing eyes of deceased',
    reference: 'Muslim 2/634'
  },
  {
    id: 58,
    title: 'Condolence to Bereaved Family',
    arabic: 'إِنَّ لِلَّهِ مَا أَخَذَ وَلَهُ مَا أَعْطَى وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى فَلْتَصْبِرْ وَلْتَحْتَسِبْ',
    transliteration: 'Inna lillahi ma akhadha wa lahu ma a\'ta, wa kullu shay\'in indahu bi ajalin musamma, faltasbir waltahtasib',
    translation: 'Indeed, to Allah belongs what He took, and to Him belongs what He gave, and everything with Him is for a specified term. So have patience and seek reward.',
    category: 'Death & Afterlife',
    subcategory: 'Deceased',
    times: 'When offering condolences',
    reference: 'Bukhari 2/80'
  },
  {
    id: 59,
    title: 'Protection from Grave Punishment',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ',
    transliteration: 'Allahumma inni a\'udhu bika min adhabil qabr, wa a\'udhu bika min fitnatil masihid dajjal, wa a\'udhu bika min fitnatil mahya wal mamat',
    translation: 'O Allah, I seek refuge in You from the punishment of the grave, and I seek refuge in You from the trial of the False Messiah, and I seek refuge in You from the trials of life and death.',
    category: 'Death & Afterlife',
    subcategory: 'Good Ending',
    times: 'In daily prayers',
    reference: 'Muslim 1/412'
  },

  // 40 Rabbana Duas - Quranic Supplications
  {
    id: 65,
    title: 'Rabbana 1 - Complete our Light',
    arabic: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Rabbana atmim lana nurana waghfir lana innaka ala kulli shay\'in qadir',
    translation: 'Our Lord, perfect for us our light and forgive us. Indeed, You are over all things competent.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 66:8'
  },
  {
    id: 66,
    title: 'Rabbana 2 - Do not let our hearts deviate',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
    transliteration: 'Rabbana la tuzigh qulubana ba\'da idh hadaytana wa hab lana min ladunka rahmatan innaka anta al-wahhab',
    translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:8'
  },
  {
    id: 67,
    title: 'Rabbana 3 - You will gather all people',
    arabic: 'رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِيَوْمٍ لَا رَيْبَ فِيهِ إِنَّ اللَّهَ لَا يُخْلِفُ الْمِيعَادَ',
    transliteration: 'Rabbana innaka jami\'u an-nasi liyawmin la rayba fih innallaha la yukhlifu al-mi\'ad',
    translation: 'Our Lord, surely You will gather the people for a Day about which there is no doubt. Indeed, Allah does not fail in His promise.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:9'
  },
  {
    id: 68,
    title: 'Rabbana 4 - We have believed',
    arabic: 'رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana innana amanna faghfir lana dhunubana wa qina adhaba an-nar',
    translation: 'Our Lord, indeed we have believed, so forgive us our sins and protect us from the punishment of the Fire.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:16'
  },
  {
    id: 69,
    title: 'Rabbana 5 - We have believed in what You revealed',
    arabic: 'رَبَّنَا آمَنَّا بِمَا أَنْزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ',
    transliteration: 'Rabbana amanna bima anzalta wattaba\'na ar-rasula faktubna ma\'a ash-shahidin',
    translation: 'Our Lord, we have believed in what You revealed and have followed the messenger, so register us among the witnesses.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:53'
  },
  {
    id: 70,
    title: 'Rabbana 6 - Forgive us our sins',
    arabic: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Rabbana ighfir lana dhunubana wa israfana fi amrina wa thabbit aqdamana wansurna ala al-qawmi al-kafirin',
    translation: 'Our Lord, forgive us our sins and the excess [committed] in our affairs and plant firmly our feet and give us victory over the disbelieving people.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:147'
  },
  {
    id: 71,
    title: 'Rabbana 7 - Give us good in this world',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaba an-nar',
    translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:201'
  },
  {
    id: 72,
    title: 'Rabbana 8 - Pour upon us patience',
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Rabbana afrigh alayna sabran wa thabbit aqdamana wansurna ala al-qawmi al-kafirin',
    translation: 'Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:250'
  },
  {
    id: 73,
    title: 'Rabbana 9 - Do not impose blame upon us',
    arabic: 'رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا',
    transliteration: 'Rabbana la tu\'akhidhna in nasina aw akhta\'na',
    translation: 'Our Lord, do not impose blame upon us if we have forgotten or erred.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:286'
  },
  {
    id: 74,
    title: 'Rabbana 10 - Do not lay upon us a burden',
    arabic: 'رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا',
    transliteration: 'Rabbana wa la tahmil alayna isran kama hamaltahu ala alladhina min qablina',
    translation: 'Our Lord, and lay not upon us a burden like that which You laid upon those before us.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:286'
  },
  {
    id: 75,
    title: 'Rabbana 11 - Do not burden us',
    arabic: 'رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Rabbana wa la tuhammilna ma la taqata lana bih wa\'fu anna waghfir lana warhamna anta mawlana fansurna ala al-qawmi al-kafirin',
    translation: 'Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:286'
  },
  {
    id: 76,
    title: 'Rabbana 12 - Do not let our hearts deviate',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً',
    transliteration: 'Rabbana la tuzigh qulubana ba\'da idh hadaytana wa hab lana min ladunka rahmatan',
    translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:8'
  },
  {
    id: 77,
    title: 'Rabbana 13 - Grant us from our spouses comfort',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a\'yunin waj\'alna lil-muttaqina imama',
    translation: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 25:74'
  },
  {
    id: 78,
    title: 'Rabbana 14 - We have wronged ourselves',
    arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration: 'Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakūnanna min al-khasirin',
    translation: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 7:23'
  },
  {
    id: 79,
    title: 'Rabbana 15 - Grant us victory over disbelievers',
    arabic: 'رَبَّنَا افْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِالْحَقِّ وَأَنْتَ خَيْرُ الْفَاتِحِينَ',
    transliteration: 'Rabbana iftah baynana wa bayna qawmina bil-haqqi wa anta khayru al-fatihin',
    translation: 'Our Lord, decide between us and our people in truth, and You are the best of those who give decision.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 7:89'
  },
  {
    id: 80,
    title: 'Rabbana 16 - Pour upon us patience',
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
    transliteration: 'Rabbana afrigh alayna sabran wa tawaffana muslimin',
    translation: 'Our Lord, pour upon us patience and let us die as Muslims [in submission to You].',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 7:126'
  },
  {
    id: 81,
    title: 'Rabbana 17 - Do not make us a trial',
    arabic: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلْقَوْمِ الظَّالِمِينَ',
    transliteration: 'Rabbana la taj\'alna fitnatan lil-qawmi az-zalimin',
    translation: 'Our Lord, make us not [objects of] trial for the wrongdoing people.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 10:85'
  },
  {
    id: 82,
    title: 'Rabbana 18 - Save us by Your mercy',
    arabic: 'رَبَّنَا وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Rabbana wa najjina birahmatika min al-qawmi al-kafirin',
    translation: 'Our Lord, and save us by Your mercy from the disbelieving people.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 10:86'
  },
  {
    id: 83,
    title: 'Rabbana 19 - You have placed trust upon us',
    arabic: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلَّذِينَ كَفَرُوا وَاغْفِرْ لَنَا رَبَّنَا إِنَّكَ أَنْتَ الْعَزِيزُ الْحَكِيمُ',
    transliteration: 'Rabbana la taj\'alna fitnatan lilladhina kafaru waghfir lana rabbana innaka anta al-azizu al-hakim',
    translation: 'Our Lord, make us not [objects of] trial for those who disbelieve, and forgive us, our Lord. Indeed, it is You who is the Exalted in Might, the Wise.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 60:5'
  },
  {
    id: 84,
    title: 'Rabbana 20 - You are our protector',
    arabic: 'رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ الْمَصِيرُ',
    transliteration: 'Rabbana alayka tawakkalna wa ilayka anabna wa ilaykal-masir',
    translation: 'Our Lord, upon You we have relied, and to You we have returned, and to You is the destination.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 60:4'
  },
  {
    id: 85,
    title: 'Rabbana 21 - Grant us good in this world',
    arabic: 'رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
    transliteration: 'Rabbana atina min ladunka rahmatan wa hayyi\' lana min amrina rashada',
    translation: 'Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 18:10'
  },
  {
    id: 86,
    title: 'Rabbana 22 - Accept from us',
    arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Rabbana taqabbal minna innaka anta as-sami\'u al-alim',
    translation: 'Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:127'
  },
  {
    id: 87,
    title: 'Rabbana 23 - Make us Muslims to You',
    arabic: 'رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِنْ ذُرِّيَّتِنَا أُمَّةً مُسْلِمَةً لَكَ وَأَرِنَا مَنَاسِكَنَا وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    transliteration: 'Rabbana waj\'alna muslimayni laka wa min dhurriyyatina ummatan muslimatan laka wa arina manasikana wa tub alayna innaka anta at-tawwabu ar-rahim',
    translation: 'Our Lord, and make us Muslims [in submission] to You and from our descendants a Muslim nation [in submission] to You. And show us our rites and accept our repentance. Indeed, You are the Accepting of repentance, the Merciful.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:128'
  },
  {
    id: 88,
    title: 'Rabbana 24 - Send them a messenger',
    arabic: 'رَبَّنَا وَابْعَثْ فِيهِمْ رَسُولًا مِنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِكَ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ وَيُزَكِّيهِمْ إِنَّكَ أَنْتَ الْعَزِيزُ الْحَكِيمُ',
    transliteration: 'Rabbana wab\'ath fihim rasulan minhum yatlu alayhim ayatika wa yu\'allimuhumul-kitaba wal-hikmata wa yuzakkihim innaka anta al-azizu al-hakim',
    translation: 'Our Lord, and send among them a messenger from themselves who will recite to them Your verses and teach them the Book and wisdom and purify them. Indeed, You are the Exalted in Might, the Wise.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 2:129'
  },
  {
    id: 89,
    title: 'Rabbana 25 - Forgive us and have mercy',
    arabic: 'رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنْتَ خَيْرُ الرَّاحِمِينَ',
    transliteration: 'Rabbana amanna faghfir lana warhamna wa anta khayru ar-rahimin',
    translation: 'Our Lord, we have believed, so forgive us and have mercy upon us, and You are the best of the merciful.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 23:109'
  },
  {
    id: 90,
    title: 'Rabbana 26 - Avert from us the punishment',
    arabic: 'رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا',
    transliteration: 'Rabbana isrif anna adhaba jahannama inna adhabaha kana gharama',
    translation: 'Our Lord, avert from us the punishment of Hell. Indeed, its punishment is ever adhering.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 25:65'
  },
  {
    id: 91,
    title: 'Rabbana 27 - Indeed it is evil',
    arabic: 'إِنَّهَا سَاءَتْ مُسْتَقَرًّا وَمُقَامًا',
    transliteration: 'Innaha sa\'at mustaqarran wa muqama',
    translation: 'Indeed, it is evil as a settlement and residence.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 25:66'
  },
  {
    id: 92,
    title: 'Rabbana 28 - Forgive us and our brothers',
    arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَحِيمٌ',
    transliteration: 'Rabbana ighfir lana wa li-ikhwanina alladhina sabaquna bil-imani wa la taj\'al fi qulubina ghillan lilladhina amanu rabbana innaka ra\'ufun rahim',
    translation: 'Our Lord, forgive us and our brothers who preceded us in faith and put not in our hearts [any] resentment toward those who have believed. Our Lord, indeed You are Kind and Merciful.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 59:10'
  },
  {
    id: 93,
    title: 'Rabbana 29 - We hear and we obey',
    arabic: 'رَبَّنَا آمَنَّا بِمَا أَنْزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ',
    transliteration: 'Rabbana amanna bima anzalta wattaba\'na ar-rasula faktubna ma\'a ash-shahidin',
    translation: 'Our Lord, we have believed in what You revealed and have followed the messenger, so register us among the witnesses.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:53'
  },
  {
    id: 94,
    title: 'Rabbana 30 - Bestow on us mercy',
    arabic: 'رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
    transliteration: 'Rabbana atina min ladunka rahmatan wa hayyi\' lana min amrina rashada',
    translation: 'Our Lord, grant us from Yourself mercy and facilitate for us right conduct in our matter.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 18:10'
  },
  {
    id: 95,
    title: 'Rabbana 31 - We believe, so forgive us',
    arabic: 'رَبَّنَا آمَنَّا فَاكْتُبْنَا مَعَ الشَّاهِدِينَ',
    transliteration: 'Rabbana amanna faktubna ma\'a ash-shahidin',
    translation: 'Our Lord, we have believed, so register us among the witnesses.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 5:83'
  },
  {
    id: 96,
    title: 'Rabbana 32 - Do not make us a trial',
    arabic: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلَّذِينَ كَفَرُوا وَاغْفِرْ لَنَا رَبَّنَا إِنَّكَ أَنْتَ الْعَزِيزُ الْحَكِيمُ',
    transliteration: 'Rabbana la taj\'alna fitnatan lilladhina kafaru waghfir lana rabbana innaka anta al-azizu al-hakim',
    translation: 'Our Lord, make us not [objects of] torment for the disbelievers and forgive us, our Lord. Indeed, it is You who is the Exalted in Might, the Wise.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 60:5'
  },
  {
    id: 97,
    title: 'Rabbana 33 - Complete for us our light',
    arabic: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Rabbana atmim lana nurana waghfir lana innaka ala kulli shay\'in qadir',
    translation: 'Our Lord, perfect for us our light and forgive us. Indeed, You are over all things competent.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 66:8'
  },
  {
    id: 98,
    title: 'Rabbana 34 - Judge between us and our people',
    arabic: 'رَبَّنَا افْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِالْحَقِّ وَأَنْتَ خَيْرُ الْفَاتِحِينَ',
    transliteration: 'Rabbana iftah baynana wa bayna qawmina bil-haqqi wa anta khayru al-fatihin',
    translation: 'Our Lord, decide between us and our people in truth, and You are the best of those who give decision.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 7:89'
  },
  {
    id: 99,
    title: 'Rabbana 35 - We rely upon You',
    arabic: 'رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ الْمَصِيرُ',
    transliteration: 'Rabbana alayka tawakkalna wa ilayka anabna wa ilaykal-masir',
    translation: 'Our Lord, upon You we have relied, and to You we have returned, and to You is the destination.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 60:4'
  },
  {
    id: 100,
    title: 'Rabbana 36 - Forgive me and my parents',
    arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    transliteration: 'Rabbana ighfir li wa liwalidayya wa lil-mu\'minina yawma yaqumu al-hisab',
    translation: 'Our Lord, forgive me and my parents and the believers the Day the account is established.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 14:41'
  },
  {
    id: 101,
    title: 'Rabbana 37 - Grant me righteous offspring',
    arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ',
    transliteration: 'Rabbi hab li min as-salihin',
    translation: 'My Lord, grant me [a child] from among the righteous.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 37:100'
  },
  {
    id: 102,
    title: 'Rabbana 38 - Enable me to be grateful',
    arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي إِنِّي تُبْتُ إِلَيْكَ وَإِنِّي مِنَ الْمُسْلِمِينَ',
    transliteration: 'Rabbi awzi\'ni an ashkura ni\'mataka allati an\'amta alayya wa ala walidayya wa an a\'mala salihan tardahu wa aslih li fi dhurriyyati inni tubtu ilayka wa inni min al-muslimin',
    translation: 'My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to work righteousness of which You will approve and make righteous for me my offspring. Indeed, I have repented to You, and indeed, I am of the Muslims.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 46:15'
  },
  {
    id: 103,
    title: 'Rabbana 39 - Keep us firm on the path',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
    transliteration: 'Rabbana la tuzigh qulubana ba\'da idh hadaytana wa hab lana min ladunka rahmatan innaka anta al-wahhab',
    translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:8'
  },
  {
    id: 104,
    title: 'Rabbana 40 - Grant us victory',
    arabic: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: 'Rabbana ighfir lana dhunubana wa israfana fi amrina wa thabbit aqdamana wansurna ala al-qawmi al-kafirin',
    translation: 'Our Lord, forgive us our sins and the excess in our affairs and plant firmly our feet and give us victory over the disbelieving people.',
    category: '40 Rabbana Duas',
    subcategory: 'Quranic Supplications',
    reference: 'Quran 3:147'
  },

  // Mosques & Adhan - Entering & Leaving Mosque
  {
    id: 105,
    title: 'Entering the Mosque',
    arabic: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Bismillah, wassalatu wassalamu ala rasulillah, Allahumma aftah li abwaba rahmatik',
    translation: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the doors of Your mercy.',
    category: 'Mosques & Adhan',
    subcategory: 'Entering & Leaving Mosque',
    times: 'When entering the mosque',
    reference: 'Muslim 1/494'
  },
  {
    id: 106,
    title: 'Leaving the Mosque',
    arabic: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Bismillah, wassalatu wassalamu ala rasulillah, Allahumma inni as\'aluka min fadhlik',
    translation: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask You from Your bounty.',
    category: 'Mosques & Adhan',
    subcategory: 'Entering & Leaving Mosque',
    times: 'When leaving the mosque',
    reference: 'Muslim 1/494'
  },
  {
    id: 107,
    title: 'Entering the Mosque (Alternative)',
    arabic: 'أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: 'A\'udhu billahil-azim, wa biwajhihil-karim, wa sultanihil-qadim, minash-shaytanir-rajim',
    translation: 'I seek refuge in Allah the Almighty, in His Noble Face, and in His Eternal Authority from Satan the accursed.',
    category: 'Mosques & Adhan',
    subcategory: 'Entering & Leaving Mosque',
    times: 'When entering the mosque',
    reference: 'Abu Dawud 1/126'
  },

  // Mosques & Adhan - After Adhan
  {
    id: 108,
    title: 'After Hearing the Adhan',
    arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    transliteration: 'Allahumma rabba hadhihid-da\'watit-tammah, wassalatil-qa\'imah, ati Muhammadan al-wasilata wal-fadilah, wab\'athhu maqaman mahmūdan alladhi wa\'adtah',
    translation: 'O Allah, Lord of this perfect call and established prayer. Grant Muhammad the intercession and favor, and raise him to the praised station which You have promised him.',
    category: 'Mosques & Adhan',
    subcategory: 'After Adhan',
    times: 'After the adhan is called',
    reference: 'Bukhari 1/152'
  },
  {
    id: 109,
    title: 'Repeat After Muadhin',
    arabic: 'يُرَدِّدُ كَمَا يَقُولُ الْمُؤَذِّنُ إِلَّا فِي الْحَيْعَلَةِ فَيَقُولُ: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Repeat as the muadhin says, except for Hayy ala as-salah and Hayy ala al-falah, then say: La hawla wa la quwwata illa billah',
    translation: 'Repeat what the caller to prayer says, except when he says "Come to prayer" and "Come to success," then say: There is no power and no strength except with Allah.',
    category: 'Mosques & Adhan',
    subcategory: 'After Adhan',
    times: 'During the adhan',
    reference: 'Muslim 1/288'
  },
  {
    id: 110,
    title: 'After Saying Dua After Adhan',
    arabic: 'مَنْ قَالَ حِينَ يَسْمَعُ الْمُؤَذِّنَ: أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، رَضِيتُ بِاللَّهِ رَبًّا، وَبِمُحَمَّدٍ رَسُولًا، وَبِالْإِسْلَامِ دِينًا، غُفِرَ لَهُ ذَنْبُهُ',
    transliteration: 'Ashhadu an la ilaha illallah wahdahu la sharika lah, wa anna Muhammadan abduhu wa rasuluh, raditu billahi rabba, wa bi Muhammadin rasula, wa bil-Islami dina',
    translation: 'I bear witness that there is no god but Allah alone with no partner, and that Muhammad is His slave and Messenger. I am pleased with Allah as my Lord, Muhammad as my Messenger, and Islam as my religion.',
    category: 'Mosques & Adhan',
    subcategory: 'After Adhan',
    times: 'After the adhan',
    reference: 'Muslim 1/290'
  },
  {
    id: 111,
    title: 'Salawat on the Prophet After Adhan',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'Allahumma salli ala Muhammad wa ala ali Muhammad, kama sallayta ala Ibrahim wa ala ali Ibrahim, innaka hamidun majid',
    translation: 'O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and upon the family of Ibrahim, indeed You are Praiseworthy and Glorious.',
    category: 'Mosques & Adhan',
    subcategory: 'After Adhan',
    times: 'After the adhan',
    reference: 'Bukhari 4/118'
  },
  {
    id: 112,
    title: 'Dua Between Adhan and Iqamah',
    arabic: 'الدُّعَاءُ بَيْنَ الْأَذَانِ وَالْإِقَامَةِ لَا يُرَدُّ',
    transliteration: 'Ad-du\'a\' bayna al-adhan wal-iqamah la yuraddu',
    translation: 'Supplication made between the adhan and iqamah is not rejected. [Make any dua you wish during this blessed time]',
    category: 'Mosques & Adhan',
    subcategory: 'After Adhan',
    times: 'Between adhan and iqamah',
    reference: 'Abu Dawud 2/62'
  },

  // Mosques & Adhan - In the Mosque
  {
    id: 113,
    title: 'Dua for Sitting in the Mosque',
    arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَفِي سَمْعِي نُورًا، وَفِي بَصَرِي نُورًا، وَمِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا، وَمِنْ أَمَامِي نُورًا، وَمِنْ خَلْفِي نُورًا، وَاجْعَلْ فِي نَفْسِي نُورًا، وَأَعْظِمْ لِي نُورًا',
    transliteration: 'Allahumma ij\'al fi qalbi nura, wa fi lisani nura, wa fi sam\'i nura, wa fi basari nura, wa min fawqi nura, wa min tahti nura, wa an yamini nura, wa an shimali nura, wa min amami nura, wa min khalfi nura, waj\'al fi nafsi nura, wa a\'zim li nura',
    translation: 'O Allah, place light in my heart, light in my tongue, light in my hearing, light in my sight, light above me, light below me, light on my right, light on my left, light in front of me, light behind me, place light in my soul, and make light abundant for me.',
    category: 'Mosques & Adhan',
    subcategory: 'In the Mosque',
    times: 'While in the mosque',
    reference: 'Bukhari 11/116'
  },
  {
    id: 114,
    title: 'Tahiyyat al-Masjid (Greeting the Mosque)',
    arabic: 'إِذَا دَخَلَ أَحَدُكُمُ الْمَسْجِدَ فَلَا يَجْلِسْ حَتَّى يُصَلِّيَ رَكْعَتَيْنِ',
    transliteration: 'Idha dakhala ahadukum al-masjida fala yajlis hatta yusalliya rak\'atayn',
    translation: 'When any of you enters the mosque, let him not sit until he prays two rak\'ahs. [Prayer of greeting to the mosque]',
    category: 'Mosques & Adhan',
    subcategory: 'In the Mosque',
    times: 'Upon entering the mosque',
    reference: 'Bukhari 1/178'
  },
  {
    id: 115,
    title: 'Before Leaving the Mosque',
    arabic: 'اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: 'Allahumma i\'simni minash-shaytanir-rajim',
    translation: 'O Allah, protect me from Satan the accursed.',
    category: 'Mosques & Adhan',
    subcategory: 'In the Mosque',
    times: 'Before leaving the mosque',
    reference: 'Ibn Majah 1/256'
  },

  // Hajj & Umrah - Talbiyah & Ihram
  {
    id: 116,
    title: 'The Talbiyah',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
    transliteration: 'Labbayka Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamda wan-ni\'mata laka wal-mulk, la sharika lak',
    translation: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Indeed all praise, grace and sovereignty belong to You. You have no partner.',
    category: 'Hajj & Umrah',
    subcategory: 'Talbiyah & Ihram',
    times: 'Throughout Hajj/Umrah',
    reference: 'Bukhari 2/560'
  },
  {
    id: 117,
    title: 'Dua When Wearing Ihram',
    arabic: 'اللَّهُمَّ إِنِّي أُرِيدُ الْعُمْرَةَ فَيَسِّرْهَا لِي وَتَقَبَّلْهَا مِنِّي',
    transliteration: 'Allahumma inni uridu al-\'umrata fa yassirha li wa taqabbalha minni',
    translation: 'O Allah, I intend to perform Umrah, so make it easy for me and accept it from me.',
    category: 'Hajj & Umrah',
    subcategory: 'Talbiyah & Ihram',
    times: 'When entering ihram for Umrah',
    reference: 'Ibn Majah 2/986'
  },
  {
    id: 118,
    title: 'Dua for Hajj Intention',
    arabic: 'اللَّهُمَّ إِنِّي أُرِيدُ الْحَجَّ فَيَسِّرْهُ لِي وَتَقَبَّلْهُ مِنِّي',
    transliteration: 'Allahumma inni uridu al-hajja fa yassirhu li wa taqabbalhu minni',
    translation: 'O Allah, I intend to perform Hajj, so make it easy for me and accept it from me.',
    category: 'Hajj & Umrah',
    subcategory: 'Talbiyah & Ihram',
    times: 'When entering ihram for Hajj',
    reference: 'Ibn Majah 2/986'
  },

  // Hajj & Umrah - Tawaf
  {
    id: 119,
    title: 'Starting Tawaf at Black Stone',
    arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    transliteration: 'Bismillahi wallahu akbar, Allahumma imanan bika wa tasdiqan bikitabika wa wafa\'an bi\'ahdika wattiba\'an lisunnati nabiyyika Muhammad sallallahu alayhi wasallam',
    translation: 'In the name of Allah, Allah is the Greatest. O Allah, out of faith in You, belief in Your Book, fulfillment of Your covenant, and following the Sunnah of Your Prophet Muhammad, peace be upon him.',
    category: 'Hajj & Umrah',
    subcategory: 'Tawaf',
    times: 'When starting tawaf at the Black Stone',
    reference: 'Ahmad 1/215'
  },
  {
    id: 120,
    title: 'Between Yemeni Corner and Black Stone',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar',
    translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    category: 'Hajj & Umrah',
    subcategory: 'Tawaf',
    times: 'Between Yemeni corner and Black Stone',
    reference: 'Abu Dawud 2/179'
  },
  {
    id: 121,
    title: 'During Tawaf (General)',
    arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Subhanallah walhamdulillah wa la ilaha illallah wallahu akbar wa la hawla wa la quwwata illa billah',
    translation: 'Glory be to Allah, all praise is to Allah, there is no god but Allah, Allah is the Greatest, and there is no power or strength except with Allah.',
    category: 'Hajj & Umrah',
    subcategory: 'Tawaf',
    times: 'Throughout tawaf',
    reference: 'General remembrance'
  },
  {
    id: 122,
    title: 'After Completing Tawaf',
    arabic: 'اللَّهُمَّ إِنَّ الْبَيْتَ بَيْتُكَ وَالْحَرَمَ حَرَمُكَ وَالْأَمْنَ أَمْنُكَ وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ',
    transliteration: 'Allahumma innal-bayta baytuk wal-harama haramuk wal-amna amnuk wa hadha maqamu al-\'a\'idhi bika minan-nar',
    translation: 'O Allah, this House is Your House, the Sanctuary is Your Sanctuary, the security is Your security, and this is the place of one who seeks refuge with You from the Fire.',
    category: 'Hajj & Umrah',
    subcategory: 'Tawaf',
    times: 'After completing tawaf',
    reference: 'Ibn Majah 2/986'
  },

  // Hajj & Umrah - Sa'i
  {
    id: 123,
    title: 'At Safa',
    arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ',
    transliteration: 'Inna as-Safa wal-Marwata min sha\'a\'iri Allah, abda\'u bima bada\'allahu bih',
    translation: 'Indeed, Safa and Marwa are among the signs of Allah. I begin with what Allah began with.',
    category: 'Hajj & Umrah',
    subcategory: 'Sa\'i',
    times: 'When reaching Safa',
    reference: 'Muslim 2/888'
  },
  {
    id: 124,
    title: 'On Safa and Marwa Hills',
    arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ وَنَصَرَ عَبْدَهُ وَهَزَمَ الْأَحْزَابَ وَحْدَهُ',
    transliteration: 'Allahu akbar, Allahu akbar, Allahu akbar, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay\'in qadir, la ilaha illallahu wahdah, anjaza wa\'dahu wa nasara abdahu wa hazamal-ahzaba wahdah',
    translation: 'Allah is the Greatest (3x). There is no god but Allah alone with no partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things competent. There is no god but Allah alone, He fulfilled His promise, supported His servant, and defeated the confederates alone.',
    category: 'Hajj & Umrah',
    subcategory: 'Sa\'i',
    times: 'On top of Safa and Marwa',
    reference: 'Muslim 2/888'
  },
  {
    id: 125,
    title: 'Between Safa and Marwa',
    arabic: 'رَبِّ اغْفِرْ وَارْحَمْ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ',
    transliteration: 'Rabbi ighfir warham innaka antal-a\'azzu al-akram',
    translation: 'My Lord, forgive and have mercy, indeed You are the Most Mighty, the Most Generous.',
    category: 'Hajj & Umrah',
    subcategory: 'Sa\'i',
    times: 'While walking between Safa and Marwa',
    reference: 'Ibn Majah 2/1003'
  },

  // Hajj & Umrah - At Sacred Sites
  {
    id: 126,
    title: 'At Arafat',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay\'in qadir',
    translation: 'There is no god but Allah alone, with no partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things competent.',
    category: 'Hajj & Umrah',
    subcategory: 'At Sacred Sites',
    times: 'At Arafat - best dua',
    reference: 'Tirmidhi 5/572'
  },
  {
    id: 127,
    title: 'Dua at Arafat (Extended)',
    arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ كَالَّذِي نَقُولُ وَخَيْرًا مِمَّا نَقُولُ، اللَّهُمَّ لَكَ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي وَإِلَيْكَ مَآبِي وَلَكَ رَبِّ تُرَاثِي، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ وَوَسْوَسَةِ الصَّدْرِ وَشَتَاتِ الْأَمْرِ',
    transliteration: 'Allahumma lakal-hamdu kalladhi naqulu wa khayran mimma naqul, Allahumma laka salati wa nusuki wa mahyaya wa mamati wa ilayka ma\'abi wa laka rabbi turathi, Allahumma inni a\'udhu bika min adhabil-qabri wa waswasatis-sadri wa shatatil-amr',
    translation: 'O Allah, to You is all praise as we say and better than what we say. O Allah, to You is my prayer, my sacrifice, my life and my death, to You is my return, and to You, my Lord, is my inheritance. O Allah, I seek refuge in You from the punishment of the grave, the whispers of the chest, and confusion in my affairs.',
    category: 'Hajj & Umrah',
    subcategory: 'At Sacred Sites',
    times: 'At Arafat',
    reference: 'Tirmidhi 3/474'
  },
  {
    id: 128,
    title: 'When Stoning the Jamarat',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu akbar',
    translation: 'Allah is the Greatest. [Say with each stone thrown]',
    category: 'Hajj & Umrah',
    subcategory: 'At Sacred Sites',
    times: 'When stoning each jamrah',
    reference: 'Bukhari 2/581'
  },
  {
    id: 129,
    title: 'After Stoning Small and Middle Jamarat',
    arabic: 'اللَّهُمَّ اجْعَلْهُ حَجًّا مَبْرُورًا وَذَنْبًا مَغْفُورًا وَسَعْيًا مَشْكُورًا',
    transliteration: 'Allahumma ij\'alhu hajjan mabrura wa dhanban maghfura wa sa\'yan mashkura',
    translation: 'O Allah, make this an accepted Hajj, a forgiven sin, and an appreciated effort.',
    category: 'Hajj & Umrah',
    subcategory: 'At Sacred Sites',
    times: 'After stoning',
    reference: 'Ibn Khuzaymah 4/271'
  },
  {
    id: 130,
    title: 'Drinking Zamzam Water',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ',
    transliteration: 'Allahumma inni as\'aluka ilman nafi\'an wa rizqan wasi\'an wa shifa\'an min kulli da\'',
    translation: 'O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every disease.',
    category: 'Hajj & Umrah',
    subcategory: 'At Sacred Sites',
    times: 'When drinking zamzam',
    reference: 'Ibn Majah 2/1018'
  },
  {
    id: 131,
    title: 'At Multazam (between door and Black Stone)',
    arabic: 'اللَّهُمَّ يَا رَبَّ الْبَيْتِ الْعَتِيقِ، أَعْتِقْ رَقَبَتِي مِنَ النَّارِ، وَأَعِذْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ، وَأَعِذْنِي مِنْ كُلِّ سُوءٍ، وَقَنِّعْنِي بِمَا رَزَقْتَنِي، وَبَارِكْ لِي فِيهِ',
    transliteration: 'Allahumma ya rabbal-baytil-atiq, a\'tiq raqabati minan-nar, wa a\'idhni minash-shaytanir-rajim, wa a\'idhni min kulli su\', wa qanni\'ni bima razaqtani, wa barik li fih',
    translation: 'O Allah, O Lord of the Ancient House, free my neck from the Fire, protect me from Satan the accursed, protect me from all evil, make me content with what You have provided me, and bless it for me.',
    category: 'Hajj & Umrah',
    subcategory: 'At Sacred Sites',
    times: 'At Multazam',
    reference: 'Abu Dawud 2/178'
  },
  {
    id: 132,
    title: 'Leaving Makkah',
    arabic: 'اللَّهُمَّ لَا تَجْعَلْهُ آخِرَ الْعَهْدِ مِنْ بَيْتِكَ الْحَرَامِ، وَيَسِّرْ لِي الْعَوْدَةَ إِلَيْهِ',
    transliteration: 'Allahumma la taj\'alhu akhiral-ahdi min baytikal-haram, wa yassir liyal-\'awdata ilayh',
    translation: 'O Allah, do not make this the last time I visit Your Sacred House, and make it easy for me to return to it.',
    category: 'Hajj & Umrah',
    subcategory: 'At Sacred Sites',
    times: 'When leaving Makkah',
    reference: 'General supplication'
  },

  // Ramadan - Fasting
  {
    id: 133,
    title: 'Intention for Fasting (Niyyah)',
    arabic: 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: 'Wa bisawmi ghadin nawytu min shahri Ramadan',
    translation: 'I intend to fast tomorrow for the month of Ramadan. [Note: Intention can be made in the heart]',
    category: 'Ramadan',
    subcategory: 'Fasting',
    times: 'Before dawn (can be made at night)',
    reference: 'General practice'
  },
  {
    id: 134,
    title: 'Breaking the Fast (Iftar)',
    arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allahumma inni laka sumtu wa bika amantu wa \'alayka tawakkaltu wa \'ala rizqika aftartu',
    translation: 'O Allah, for You I have fasted, in You I have believed, upon You I have relied, and with Your provision I break my fast.',
    category: 'Ramadan',
    subcategory: 'Fasting',
    times: 'When breaking fast',
    reference: 'Abu Dawud 2/306'
  },
  {
    id: 135,
    title: 'After Breaking Fast',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: 'Dhahaba az-zama\'u wabtallatil-\'uruqu wa thabata al-ajru in sha\' Allah',
    translation: 'The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
    category: 'Ramadan',
    subcategory: 'Fasting',
    times: 'After iftar',
    reference: 'Abu Dawud 2/306'
  },
  {
    id: 136,
    title: 'When Someone is Fasting',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي',
    transliteration: 'Allahumma inni as\'aluka birahmatika allati wasi\'at kulla shay\'in an taghfira li',
    translation: 'O Allah, I ask You by Your mercy that encompasses all things to forgive me.',
    category: 'Ramadan',
    subcategory: 'Fasting',
    times: 'While fasting',
    reference: 'Ibn Majah 2/1271'
  },

  // Ramadan - Iftar & Suhoor
  {
    id: 137,
    title: 'Dua Before Iftar',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: 'Allahumma laka sumtu wa \'ala rizqika aftartu',
    translation: 'O Allah, for You I have fasted and with Your provision I break my fast.',
    category: 'Ramadan',
    subcategory: 'Iftar & Suhoor',
    times: 'Just before breaking fast',
    reference: 'Abu Dawud 2/306'
  },
  {
    id: 138,
    title: 'When Breaking Fast at Someone\'s Home',
    arabic: 'أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ',
    transliteration: 'Aftara \'indakumu as-sa\'imun, wa akala ta\'amakumu al-abrar, wa sallat \'alaykumu al-mala\'ikah',
    translation: 'May the fasting break their fast with you, may the righteous eat your food, and may the angels send prayers upon you.',
    category: 'Ramadan',
    subcategory: 'Iftar & Suhoor',
    times: 'When breaking fast at someone\'s house',
    reference: 'Abu Dawud 3/367'
  },
  {
    id: 139,
    title: 'At Suhoor (Pre-dawn Meal)',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allahumma inni as\'aluka min fadlik',
    translation: 'O Allah, I ask You from Your bounty. [The Prophet encouraged eating suhoor for blessings]',
    category: 'Ramadan',
    subcategory: 'Iftar & Suhoor',
    times: 'During suhoor',
    reference: 'Bukhari 3/31'
  },

  // Ramadan - Laylatul Qadr
  {
    id: 140,
    title: 'Dua for Laylatul Qadr',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allahumma innaka \'afuwwun karimun tuhibbu al-\'afwa fa\'fu \'anni',
    translation: 'O Allah, You are Most Forgiving, and You love forgiveness, so forgive me.',
    category: 'Ramadan',
    subcategory: 'Laylatul Qadr',
    times: 'On the Night of Power (last 10 nights)',
    reference: 'Tirmidhi 5/534'
  },
  {
    id: 141,
    title: 'Seeking Laylatul Qadr',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
    transliteration: 'Allahumma inni as\'alukal-huda wat-tuqa wal-\'afafa wal-ghina',
    translation: 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
    category: 'Ramadan',
    subcategory: 'Laylatul Qadr',
    times: 'During the last 10 nights',
    reference: 'Muslim 4/2721'
  },
  {
    id: 142,
    title: 'Night Worship in Ramadan',
    arabic: 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا',
    transliteration: 'Allahumma ij\'al fi qalbi nura, wa fi basari nura, wa fi sam\'i nura',
    translation: 'O Allah, place light in my heart, light in my sight, and light in my hearing.',
    category: 'Ramadan',
    subcategory: 'Laylatul Qadr',
    times: 'During night prayers',
    reference: 'Bukhari 11/116'
  },

  // Ramadan - Special Ramadan Duas
  {
    id: 143,
    title: 'Welcoming Ramadan',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي رَجَبٍ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ',
    transliteration: 'Allahumma barik lana fi Rajab wa Sha\'ban wa ballighna Ramadan',
    translation: 'O Allah, bless us in Rajab and Sha\'ban and allow us to reach Ramadan.',
    category: 'Ramadan',
    subcategory: 'Special Ramadan Duas',
    times: 'Before Ramadan begins',
    reference: 'Ahmad 1/259'
  },
  {
    id: 144,
    title: 'After Taraweeh',
    arabic: 'سُبْحَانَ ذِي الْمُلْكِ وَالْمَلَكُوتِ، سُبْحَانَ ذِي الْعِزَّةِ وَالْعَظَمَةِ وَالْهَيْبَةِ وَالْقُدْرَةِ وَالْكِبْرِيَاءِ وَالْجَبَرُوتِ، سُبْحَانَ الْمَلِكِ الْحَيِّ الَّذِي لَا يَنَامُ وَلَا يَمُوتُ أَبَدًا أَبَدًا',
    transliteration: 'Subhana dhil-mulki wal-malakut, subhana dhil-\'izzati wal-\'azamati wal-haybati wal-qudrathi wal-kibriya\' wal-jabarut, subhana al-maliki al-hayyi alladhi la yanamu wa la yamutu abadan abada',
    translation: 'Glory be to the Owner of dominion and sovereignty. Glory be to the Owner of might, greatness, majesty, power, pride, and supremacy. Glory be to the King, the Ever-Living who neither sleeps nor dies, ever and eternally.',
    category: 'Ramadan',
    subcategory: 'Special Ramadan Duas',
    times: 'After taraweeh prayer',
    reference: 'Nasa\'i 3/75'
  },
  {
    id: 145,
    title: 'Seeking Forgiveness in Ramadan',
    arabic: 'رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ',
    transliteration: 'Rabbi ighfir warham wa anta khayru ar-rahimin',
    translation: 'My Lord, forgive and have mercy, and You are the best of those who show mercy.',
    category: 'Ramadan',
    subcategory: 'Special Ramadan Duas',
    times: 'Throughout Ramadan',
    reference: 'Quran 23:118'
  },
  {
    id: 146,
    title: 'Before Eid (End of Ramadan)',
    arabic: 'اللَّهُمَّ تَقَبَّلْ مِنَّا صِيَامَنَا وَقِيَامَنَا وَرُكُوعَنَا وَسُجُودَنَا',
    transliteration: 'Allahumma taqabbal minna siyamana wa qiyamana wa ruku\'ana wa sujudana',
    translation: 'O Allah, accept from us our fasting, our standing in prayer, our bowing, and our prostration.',
    category: 'Ramadan',
    subcategory: 'Special Ramadan Duas',
    times: 'Last days of Ramadan',
    reference: 'General supplication'
  },
  {
    id: 147,
    title: 'Completing the Month',
    arabic: 'اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ وَالسَّلَامَةِ وَالْإِسْلَامِ',
    transliteration: 'Allahumma ahillahu \'alayna bil-amni wal-iman was-salamati wal-Islam',
    translation: 'O Allah, bring this month upon us with security, faith, safety, and Islam.',
    category: 'Ramadan',
    subcategory: 'Special Ramadan Duas',
    times: 'At the beginning and end of Ramadan',
    reference: 'Tirmidhi 5/504'
  },
  {
    id: 148,
    title: 'For Acceptance of Fasting',
    arabic: 'اللَّهُمَّ اجْعَلْ صِيَامِي فِيهِ صِيَامَ الصَّائِمِينَ، وَقِيَامِي فِيهِ قِيَامَ الْقَائِمِينَ',
    transliteration: 'Allahumma ij\'al siyami fihi siyama as-sa\'imin, wa qiyami fihi qiyama al-qa\'imin',
    translation: 'O Allah, make my fasting in it the fasting of those who truly fast, and my standing in prayer the standing of those who truly stand in prayer.',
    category: 'Ramadan',
    subcategory: 'Special Ramadan Duas',
    times: 'During Ramadan',
    reference: 'General supplication'
  },

  // Jumu'ah (Friday) - Friday Blessings
  {
    id: 149,
    title: 'Salawat on the Prophet (Short)',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    transliteration: 'Allahumma salli ala Muhammad wa ala ali Muhammad',
    translation: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad.',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'Friday Blessings',
    times: 'Throughout Friday - abundantly',
    reference: 'Bukhari 11/143'
  },
  {
    id: 150,
    title: 'Salawat on the Prophet (Complete)',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'Allahumma salli ala Muhammad wa ala ali Muhammad, kama sallayta ala Ibrahim wa ala ali Ibrahim, innaka hamidun majid. Allahumma barik ala Muhammad wa ala ali Muhammad, kama barakta ala Ibrahim wa ala ali Ibrahim, innaka hamidun majid',
    translation: 'O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious.',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'Friday Blessings',
    times: 'On Friday - highly recommended',
    reference: 'Bukhari 4/118'
  },
  {
    id: 151,
    title: 'Virtue of Friday',
    arabic: 'إِنَّ مِنْ أَفْضَلِ أَيَّامِكُمْ يَوْمَ الْجُمُعَةِ، فَأَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ فِيهِ',
    transliteration: 'Inna min afdali ayyamikum yawmul-jumu\'ah, fa akthiru alayya minas-salati fih',
    translation: 'Indeed, among your best days is Friday, so send abundant blessings upon me on it. [Instruction from the Prophet ﷺ]',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'Friday Blessings',
    times: 'On Friday',
    reference: 'Abu Dawud 1/275'
  },

  // Jumu'ah (Friday) - Before Jumu'ah
  {
    id: 152,
    title: 'Reciting Surah Al-Kahf',
    arabic: 'مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ',
    transliteration: 'Man qara\'a suratal-Kahf yawmal-jumu\'ah ada\'a lahu minan-nuri ma baynal-jumu\'atayn',
    translation: 'Whoever recites Surah Al-Kahf on Friday, a light will shine for him between the two Fridays. [Recommended to recite Surah Al-Kahf on Friday]',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'Before Jumu\'ah',
    times: 'Friday - before or after Jumu\'ah prayer',
    reference: 'Al-Hakim 2/399'
  },
  {
    id: 153,
    title: 'Preparation for Jumu\'ah',
    arabic: 'اللَّهُمَّ اجْعَلْنِي مِنَ الَّذِينَ إِذَا أَحْسَنُوا اسْتَبْشَرُوا وَإِذَا أَساءُوا اسْتَغْفَرُوا',
    transliteration: 'Allahumma ij\'alni minal-ladhina idha ahsanu istabsharu wa idha asa\'u istaghfaru',
    translation: 'O Allah, make me among those who when they do good, they rejoice, and when they do wrong, they seek forgiveness.',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'Before Jumu\'ah',
    times: 'Preparing for Friday',
    reference: 'Ibn Majah 3/980'
  },

  // Jumu'ah (Friday) - During Jumu'ah
  {
    id: 154,
    title: 'Seeking the Blessed Hour',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ وَخَيْرَ مَا فِيهِ وَأَعُوذُ بِكَ مِنْ شَرِّ هَذَا الْيَوْمِ وَشَرِّ مَا فِيهِ',
    transliteration: 'Allahumma inni as\'aluka khayra hadhal-yawmi wa khayra ma fih, wa a\'udhu bika min sharri hadhal-yawmi wa sharri ma fih',
    translation: 'O Allah, I ask You for the good of this day and the good that is in it, and I seek refuge in You from the evil of this day and the evil that is in it.',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'During Jumu\'ah',
    times: 'Friday morning',
    reference: 'General supplication'
  },
  {
    id: 155,
    title: 'In the Last Hour of Friday',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
    transliteration: 'Allahumma inni as\'alukal-jannata wa a\'udhu bika minan-nar',
    translation: 'O Allah, I ask You for Paradise and I seek refuge in You from the Fire. [The blessed hour when duas are accepted]',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'During Jumu\'ah',
    times: 'Last hour before Maghrib on Friday',
    reference: 'Abu Dawud 1/231'
  },
  {
    id: 156,
    title: 'During Khutbah',
    arabic: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي',
    transliteration: 'Allahumma aslih li dini alladhi huwa \'ismatu amri wa aslih li dunyaya allati fiha ma\'ashi wa aslih li akhirati allati fiha ma\'adi',
    translation: 'O Allah, rectify for me my religion which is the safeguard of my affairs, and rectify for me my worldly life wherein is my livelihood, and rectify for me my Hereafter to which is my return.',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'During Jumu\'ah',
    times: 'While listening to khutbah',
    reference: 'Muslim 4/2087'
  },

  // Jumu'ah (Friday) - After Jumu'ah
  {
    id: 157,
    title: 'After Jumu\'ah Prayer',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: 'Allahumma antas-salamu wa minkas-salam, tabarakta ya dhal-jalali wal-ikram',
    translation: 'O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of majesty and honor.',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'After Jumu\'ah',
    times: 'After completing the prayer',
    reference: 'Muslim 1/414'
  },
  {
    id: 158,
    title: 'Gratitude for Friday',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلَا أَنْ هَدَانَا اللَّهُ',
    transliteration: 'Alhamdulillahil-ladhi hadana lihadha wa ma kunna linahtadiya lawla an hadanallah',
    translation: 'All praise is to Allah who guided us to this, and we would not have been guided if Allah had not guided us.',
    category: 'Jumu\'ah (Friday)',
    subcategory: 'After Jumu\'ah',
    times: 'After Friday prayer',
    reference: 'Quran 7:43'
  }
];

export const getDuasByCategory = (category: string): Dua[] => {
  return duas.filter(dua => dua.category === category);
};

export const getDuasBySubcategory = (category: string, subcategory: string): Dua[] => {
  return duas.filter(dua => dua.category === category && dua.subcategory === subcategory);
};

export const getAllCategories = (): string[] => {
  return duaCategories.map(cat => cat.category);
};

export const getSubcategoriesByCategory = (category: string): DuaSubcategory[] => {
  const categoryData = duaCategories.find(cat => cat.category === category);
  return categoryData ? categoryData.subcategories : [];
};
