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
    category: "Travel Duas",
    subcategories: [
      { name: "Before Journey", examples: ["Dua when starting travel"] },
      { name: "Riding Vehicle", examples: ["Dua for riding transport"] },
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
    category: "Travel & Safety",
    subcategories: [
      { name: "New Town", examples: ["Dua when entering a new place"] },
      { name: "Protection", examples: ["Dua for safety on a journey"] }
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

  // Travel Duas - Before Journey
  {
    id: 23,
    title: 'Before Travel',
    arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى',
    transliteration: 'Allahumma inni nas\'aluka fi safarina hadha al-birra wat-taqwa wa min al-amali ma tardha',
    translation: 'O Allah, we ask You for righteousness and piety in this journey of ours, and for deeds that will please You.',
    category: 'Travel Duas',
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
    category: 'Travel Duas',
    subcategory: 'Before Journey',
    times: 'When starting travel',
    reference: 'Quran 43:13-14'
  },

  // Travel Duas - Riding Vehicle
  {
    id: 25,
    title: 'Riding Transport',
    arabic: 'بِسْمِ اللَّهِ، الْحَمْدُ لِلَّهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
    transliteration: 'Bismillah, alhamdulillah, subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin',
    translation: 'In the name of Allah, praise be to Allah. Glory be to Him who has subjected this to us, and we were not able to do it.',
    category: 'Travel Duas',
    subcategory: 'Riding Vehicle',
    times: 'When riding',
    reference: 'Quran 43:13'
  },

  // Travel Duas - Returning
  {
    id: 26,
    title: 'Upon Returning Home',
    arabic: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
    transliteration: 'A\'ibuna ta\'ibuna abiduna li rabbina hamidun',
    translation: 'We return, repentant, worshipping our Lord, praising.',
    category: 'Travel Duas',
    subcategory: 'Returning',
    times: 'Upon returning',
    reference: 'Muslim 2/986'
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
