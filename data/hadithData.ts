export interface HadithSubcategory {
  name: string;
  examples: string[];
}

export interface HadithCollection {
  collection: string;
  subcategories: HadithSubcategory[];
}

export interface Hadith {
  id: number;
  text: string;
  arabic?: string;
  narrator: string;
  collection: string;
  subcategory: string;
  source: string;
  bookNumber?: string;
  hadithNumber?: string;
}

export const hadithCollections: HadithCollection[] = [
  {
    collection: "Sahih al-Bukhari",
    subcategories: [
      { name: "Iman (Faith)", examples: ["Hadith on the pillars of faith", "Hadith on sincerity"] },
      { name: "Salah (Prayer)", examples: ["Hadith on importance of salah", "Hadith on praying in congregation"] },
      { name: "Zakah (Charity)", examples: ["Hadith on giving zakat", "Hadith on sadaqah"] },
      { name: "Hajj", examples: ["Hadith on virtues of Hajj"] },
      { name: "Akhlaq (Character)", examples: ["Hadith on honesty", "Hadith on patience"] }
    ]
  },
  {
    collection: "Sahih Muslim",
    subcategories: [
      { name: "Iman (Faith)", examples: ["Hadith on tawheed", "Hadith on angels and books"] },
      { name: "Salah (Prayer)", examples: ["Hadith on salah times", "Hadith on witr prayer"] },
      { name: "Fasting", examples: ["Hadith on Ramadan fasting", "Hadith on virtues of fasting"] },
      { name: "Zakah & Sadaqah", examples: ["Hadith on wealth purification", "Hadith on generosity"] },
      { name: "Adab (Manners)", examples: ["Hadith on greeting with salam", "Hadith on respecting elders"] }
    ]
  },
  {
    collection: "Sunan Abu Dawood",
    subcategories: [
      { name: "Purification", examples: ["Hadith on wudu", "Hadith on ghusl"] },
      { name: "Salah", examples: ["Hadith on prayer etiquette"] },
      { name: "Marriage", examples: ["Hadith on nikah", "Hadith on spouse rights"] },
      { name: "Trade & Business", examples: ["Hadith on halal trade", "Hadith on avoiding riba"] },
      { name: "Punishments", examples: ["Hadith on justice", "Hadith on hudood"] }
    ]
  },
  {
    collection: "Jamiʿ at-Tirmidhi",
    subcategories: [
      { name: "Virtues of the Prophet ﷺ", examples: ["Hadith on Shama'il", "Hadith on following the Prophet"] },
      { name: "Supplications", examples: ["Hadith on morning adhkar", "Hadith on dua after salah"] },
      { name: "Knowledge", examples: ["Hadith on seeking knowledge"] },
      { name: "Fitan (Trials)", examples: ["Hadith on end times", "Hadith on fitnah"] }
    ]
  },
  {
    collection: "Sunan an-Nasa'i",
    subcategories: [
      { name: "Purification", examples: ["Hadith on tayammum", "Hadith on ablution"] },
      { name: "Salah", examples: ["Hadith on prayer times", "Hadith on voluntary prayers"] },
      { name: "Zakah", examples: ["Hadith on zakat distribution"] },
      { name: "Fasting", examples: ["Hadith on sawm of Ramadan"] }
    ]
  },
  {
    collection: "Sunan Ibn Majah",
    subcategories: [
      { name: "Introduction", examples: ["Hadith on seeking knowledge"] },
      { name: "Salah", examples: ["Hadith on prayer rewards"] },
      { name: "Marriage", examples: ["Hadith on wedding feast"] },
      { name: "Business", examples: ["Hadith on fairness in trade"] },
      { name: "Trials & Tribulations", examples: ["Hadith on akhir al-zaman"] }
    ]
  },
  {
    collection: "Muwatta Malik",
    subcategories: [
      { name: "Salah", examples: ["Hadith on qiyam al-layl"] },
      { name: "Zakah", examples: ["Hadith on wealth purification"] },
      { name: "Hajj", examples: ["Hadith on ihram"] },
      { name: "Character", examples: ["Hadith on good manners"] }
    ]
  },
  {
    collection: "Riyad as-Salihin",
    subcategories: [
      { name: "Ikhlas (Sincerity)", examples: ["Hadith on intentions"] },
      { name: "Patience & Gratitude", examples: ["Hadith on sabr", "Hadith on shukr"] },
      { name: "Repentance", examples: ["Hadith on tawbah"] },
      { name: "Duas", examples: ["Hadith on supplications"] },
      { name: "Good Conduct", examples: ["Hadith on kindness", "Hadith on humility"] }
    ]
  },
  {
    collection: "40 Hadith Nawawi",
    subcategories: [
      { name: "Foundations of Islam", examples: ["Hadith on intentions", "Hadith on Islam pillars"] },
      { name: "Akhlaq", examples: ["Hadith on ihsan", "Hadith on brotherhood"] },
      { name: "Knowledge", examples: ["Hadith on halal & haram"] },
      { name: "Spirituality", examples: ["Hadith on taqwa"] }
    ]
  }
];

export const hadiths: Hadith[] = [
  // Sahih al-Bukhari - Iman (Faith)
  {
    id: 1,
    text: "Actions are according to intentions, and every person will have what they intended.",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Iman (Faith)",
    source: "Sahih al-Bukhari",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 2,
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    arabic: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Iman (Faith)",
    source: "Sahih al-Bukhari",
    bookNumber: "13",
    hadithNumber: "7"
  },

  // Sahih al-Bukhari - Salah (Prayer)
  {
    id: 3,
    text: "The prayer is the pillar of religion, and whoever abandons it has destroyed religion.",
    arabic: "الصَّلَاةُ عِمَادُ الدِّينِ، مَنْ تَرَكَهَا فَقَدْ هَدَمَ الدِّينَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Salah (Prayer)",
    source: "Sahih al-Bukhari",
    bookNumber: "8",
    hadithNumber: "40"
  },
  {
    id: 4,
    text: "The first thing that will be judged among a person's deeds on the Day of Resurrection is the prayer.",
    arabic: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلَاةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Salah (Prayer)",
    source: "Sahih al-Bukhari",
    bookNumber: "8",
    hadithNumber: "41"
  },

  // Sahih al-Bukhari - Zakah (Charity)
  {
    id: 5,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Zakah (Charity)",
    source: "Sahih al-Bukhari",
    bookNumber: "24",
    hadithNumber: "12"
  },

  // Sahih Muslim - Iman (Faith)
  {
    id: 6,
    text: "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, performing prayer, giving zakat, making pilgrimage, and fasting Ramadan.",
    arabic: "بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Iman (Faith)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "8"
  },

  // Sahih Muslim - Fasting
  {
    id: 7,
    text: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Fasting",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "760"
  },

  // Additional Sahih Muslim - Iman (Faith)
  {
    id: 41,
    text: "The believer is not one who curses, nor one who is abusive, nor one who is indecent.",
    arabic: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا بِاللَّعَّانِ وَلَا بِالْفَاحِشِ وَلَا بِالْبَذِيءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Iman (Faith)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 42,
    text: "The most perfect of believers in faith is the best of them in character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Iman (Faith)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 43,
    text: "Faith has seventy-odd branches, and modesty is a branch of faith.",
    arabic: "الإِيمَانُ بِضْعٌ وَسَبْعُونَ شُعْبَةً، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Iman (Faith)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 44,
    text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Iman (Faith)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 45,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Iman (Faith)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Additional Sahih Muslim - Salah (Prayer)
  {
    id: 46,
    text: "The first thing that will be judged among a person's deeds on the Day of Resurrection is the prayer.",
    arabic: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلَاةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Salah (Prayer)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 47,
    text: "The prayer of a person in congregation is twenty-five times better than his prayer in his house or market.",
    arabic: "صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تَضْعُفُ عَلَى صَلَاتِهِ فِي بَيْتِهِ وَفِي سُوقِهِ خَمْسًا وَعِشْرِينَ ضِعْفًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Salah (Prayer)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 48,
    text: "When you hear the call to prayer, say the same words as the mu'adhdhin says.",
    arabic: "إِذَا سَمِعْتُمُ النِّدَاءَ فَقُولُوا مِثْلَ مَا يَقُولُ الْمُؤَذِّنُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Salah (Prayer)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 49,
    text: "The best of prayers after the obligatory prayers is the night prayer.",
    arabic: "أَفْضَلُ الصَّلَاةِ بَعْدَ الْفَرِيضَةِ صَلَاةُ اللَّيْلِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Salah (Prayer)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 50,
    text: "The prayer of a person in congregation is twenty-seven times better than his prayer alone.",
    arabic: "صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تَضْعُفُ عَلَى صَلَاتِهِ وَحْدَهُ سَبْعًا وَعِشْرِينَ ضِعْفًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Salah (Prayer)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Additional Sahih Muslim - Fasting
  {
    id: 51,
    text: "Charity does not decrease wealth.",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Fasting",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 52,
    text: "The upper hand is better than the lower hand.",
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Fasting",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 53,
    text: "Every Muslim has to give in charity. The people asked: If someone has nothing to give, what will he do? He said: He should work with his hands and benefit himself and also give in charity.",
    arabic: "عَلَى كُلِّ مُسْلِمٍ صَدَقَةٌ. قَالُوا: فَإِنْ لَمْ يَجِدْ؟ قَالَ: فَيَعْمَلُ بِيَدَيْهِ فَيَنْفَعُ نَفْسَهُ وَيَتَصَدَّقُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Fasting",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 54,
    text: "The best charity is that given when one is healthy and greedy.",
    arabic: "أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Fasting",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 55,
    text: "Protect yourself from the Fire even with half a date.",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Fasting",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Additional Sahih Muslim - Zakah & Sadaqah
  {
    id: 56,
    text: "The reward of Hajj Mabrur (accepted Hajj) is nothing but Paradise.",
    arabic: "الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Zakah & Sadaqah",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 57,
    text: "Whoever performs Hajj for Allah's pleasure and does not have sexual relations with his wife, and does not do evil or sins, then he will return (after Hajj free from all sins) as if he were born anew.",
    arabic: "مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Zakah & Sadaqah",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 58,
    text: "The people of Yemen have come to you, and they are more gentle and soft-hearted. Belief is Yemenite and wisdom is Yemenite.",
    arabic: "جَاءَ أَهْلُ الْيَمَنِ هُمْ أَرَقُّ قُلُوبًا وَأَلْيَنُ أَفْئِدَةً، الْإِيمَانُ يَمَانِيٌّ وَالْحِكْمَةُ يَمَانِيَّةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Zakah & Sadaqah",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 59,
    text: "The best of days is the Day of Arafah.",
    arabic: "أَفْضَلُ الْأَيَّامِ يَوْمُ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Zakah & Sadaqah",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 60,
    text: "There is no day on which Allah frees more people from the Fire than the Day of Arafah.",
    arabic: "مَا مِنْ يَوْمٍ أَكْثَرَ مِنْ أَنْ يُعْتِقَ اللَّهُ فِيهِ عَبْدًا مِنَ النَّارِ مِنْ يَوْمِ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Zakah & Sadaqah",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Additional Sahih Muslim - Adab (Manners)
  {
    id: 61,
    text: "The most beloved of people to Allah is the most beneficial to people.",
    arabic: "أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Adab (Manners)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 62,
    text: "The believer is not one who curses, nor one who is abusive, nor one who is indecent.",
    arabic: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا بِاللَّعَّانِ وَلَا بِالْفَاحِشِ وَلَا بِالْبَذِيءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Adab (Manners)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 63,
    text: "The most perfect of believers in faith is the best of them in character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Adab (Manners)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 64,
    text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Adab (Manners)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 65,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih Muslim",
    subcategory: "Adab (Manners)",
    source: "Sahih Muslim",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Sunan Abu Dawood - Purification
  {
    id: 8,
    text: "Cleanliness is half of faith.",
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Purification",
    source: "Sunan Abu Dawood",
    bookNumber: "1",
    hadithNumber: "50"
  },

  // Jamiʿ at-Tirmidhi - Supplications
  {
    id: 9,
    text: "The supplication of the fasting person when he breaks his fast is not rejected.",
    arabic: "لِلصَّائِمِ عِنْدَ فِطْرِهِ دَعْوَةٌ مُسْتَجَابَةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Supplications",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "2525"
  },

  // Jamiʿ at-Tirmidhi - Knowledge
  {
    id: 10,
    text: "Seeking knowledge is obligatory upon every Muslim.",
    arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Knowledge",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "209"
  },

  // Riyad as-Salihin - Ikhlas (Sincerity)
  {
    id: 11,
    text: "The reward of deeds depends upon the intentions, and every person will get the reward according to what he has intended.",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Ikhlas (Sincerity)",
    source: "Riyad as-Salihin",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Riyad as-Salihin - Patience & Gratitude
  {
    id: 12,
    text: "How wonderful is the affair of the believer, for his affairs are all good, and this applies to no one but the believer. If something good happens to him, he is thankful, and that is good for him. If something bad happens to him, he bears it with patience, and that is good for him.",
    arabic: "عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لِأَحَدٍ إِلَّا لِلْمُؤْمِنِ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Patience & Gratitude",
    source: "Riyad as-Salihin",
    bookNumber: "1",
    hadithNumber: "2"
  },

  // 40 Hadith Nawawi - Foundations of Islam
  {
    id: 13,
    text: "Actions are according to intentions, and every person will have what they intended.",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Foundations of Islam",
    source: "40 Hadith Nawawi",
    hadithNumber: "1"
  },

  // 40 Hadith Nawawi - Akhlaq
  {
    id: 14,
    text: "Worship Allah as if you see Him, for if you don't see Him, He sees you.",
    arabic: "اعْبُدِ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Akhlaq",
    source: "40 Hadith Nawawi",
    hadithNumber: "2"
  },

  // Sunan Ibn Majah - Introduction
  {
    id: 15,
    text: "Seeking knowledge is obligatory upon every Muslim.",
    arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Introduction",
    source: "Sunan Ibn Majah",
    bookNumber: "1",
    hadithNumber: "224"
  },

  // Additional Sunan Abu Dawood - Purification
  {
    id: 66,
    text: "The key to prayer is purification.",
    arabic: "مِفْتَاحُ الصَّلَاةِ الطُّهُورُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Purification",
    source: "Sunan Abu Dawood",
    bookNumber: "1",
    hadithNumber: "61"
  },
  {
    id: 67,
    text: "When one of you wakes up from sleep, let him wash his hands before putting them in the water for ablution.",
    arabic: "إِذَا اسْتَيْقَظَ أَحَدُكُمْ مِنْ نَوْمِهِ فَلْيَغْسِلْ يَدَيْهِ قَبْلَ أَنْ يُدْخِلَهُمَا فِي الْإِنَاءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Purification",
    source: "Sunan Abu Dawood",
    bookNumber: "1",
    hadithNumber: "101"
  },
  {
    id: 68,
    text: "The Messenger of Allah used to perform ablution for every prayer.",
    arabic: "كَانَ رَسُولُ اللَّهِ يَتَوَضَّأُ لِكُلِّ صَلَاةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Purification",
    source: "Sunan Abu Dawood",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 69,
    text: "When you perform ablution, wash your face and hands up to the elbows, and wipe your head and wash your feet up to the ankles.",
    arabic: "إِذَا تَوَضَّأْتَ فَاغْسِلْ وَجْهَكَ وَيَدَيْكَ إِلَى الْمِرْفَقَيْنِ، وَامْسَحْ بِرَأْسِكَ وَاغْسِلْ رِجْلَيْكَ إِلَى الْكَعْبَيْنِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Purification",
    source: "Sunan Abu Dawood",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 70,
    text: "The Messenger of Allah used to perform ablution with one mudd of water and ghusl with one sa' of water.",
    arabic: "كَانَ رَسُولُ اللَّهِ يَتَوَضَّأُ بِالْمُدِّ وَيَغْتَسِلُ بِالصَّاعِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Purification",
    source: "Sunan Abu Dawood",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Additional Sunan Abu Dawood - Salah
  {
    id: 71,
    text: "The first thing that will be judged among a person's deeds on the Day of Resurrection is the prayer.",
    arabic: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلَاةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Salah",
    source: "Sunan Abu Dawood",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 72,
    text: "The prayer of a person in congregation is twenty-five times better than his prayer in his house or market.",
    arabic: "صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تَضْعُفُ عَلَى صَلَاتِهِ فِي بَيْتِهِ وَفِي سُوقِهِ خَمْسًا وَعِشْرِينَ ضِعْفًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Salah",
    source: "Sunan Abu Dawood",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 73,
    text: "When you hear the call to prayer, say the same words as the mu'adhdhin says.",
    arabic: "إِذَا سَمِعْتُمُ النِّدَاءَ فَقُولُوا مِثْلَ مَا يَقُولُ الْمُؤَذِّنُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Salah",
    source: "Sunan Abu Dawood",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 74,
    text: "The best of prayers after the obligatory prayers is the night prayer.",
    arabic: "أَفْضَلُ الصَّلَاةِ بَعْدَ الْفَرِيضَةِ صَلَاةُ اللَّيْلِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Salah",
    source: "Sunan Abu Dawood",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 75,
    text: "The prayer of a person in congregation is twenty-seven times better than his prayer alone.",
    arabic: "صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تَضْعُفُ عَلَى صَلَاتِهِ وَحْدَهُ سَبْعًا وَعِشْرِينَ ضِعْفًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Salah",
    source: "Sunan Abu Dawood",
    bookNumber: "2",
    hadithNumber: "1"
  },

  // Additional Sunan Abu Dawood - Marriage
  {
    id: 76,
    text: "The most beloved of people to Allah is the most beneficial to people.",
    arabic: "أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Marriage",
    source: "Sunan Abu Dawood",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 77,
    text: "The believer is not one who curses, nor one who is abusive, nor one who is indecent.",
    arabic: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا بِاللَّعَّانِ وَلَا بِالْفَاحِشِ وَلَا بِالْبَذِيءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Marriage",
    source: "Sunan Abu Dawood",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 78,
    text: "The most perfect of believers in faith is the best of them in character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Marriage",
    source: "Sunan Abu Dawood",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 79,
    text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Marriage",
    source: "Sunan Abu Dawood",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 80,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Marriage",
    source: "Sunan Abu Dawood",
    bookNumber: "3",
    hadithNumber: "1"
  },

  // Additional Sunan Abu Dawood - Trade & Business
  {
    id: 81,
    text: "Charity does not decrease wealth.",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Trade & Business",
    source: "Sunan Abu Dawood",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 82,
    text: "The upper hand is better than the lower hand.",
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Trade & Business",
    source: "Sunan Abu Dawood",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 83,
    text: "Every Muslim has to give in charity. The people asked: If someone has nothing to give, what will he do? He said: He should work with his hands and benefit himself and also give in charity.",
    arabic: "عَلَى كُلِّ مُسْلِمٍ صَدَقَةٌ. قَالُوا: فَإِنْ لَمْ يَجِدْ؟ قَالَ: فَيَعْمَلُ بِيَدَيْهِ فَيَنْفَعُ نَفْسَهُ وَيَتَصَدَّقُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Trade & Business",
    source: "Sunan Abu Dawood",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 84,
    text: "The best charity is that given when one is healthy and greedy.",
    arabic: "أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Trade & Business",
    source: "Sunan Abu Dawood",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 85,
    text: "Protect yourself from the Fire even with half a date.",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Trade & Business",
    source: "Sunan Abu Dawood",
    bookNumber: "4",
    hadithNumber: "1"
  },

  // Additional Sunan Abu Dawood - Punishments
  {
    id: 86,
    text: "The reward of Hajj Mabrur (accepted Hajj) is nothing but Paradise.",
    arabic: "الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Punishments",
    source: "Sunan Abu Dawood",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 87,
    text: "Whoever performs Hajj for Allah's pleasure and does not have sexual relations with his wife, and does not do evil or sins, then he will return (after Hajj free from all sins) as if he were born anew.",
    arabic: "مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Punishments",
    source: "Sunan Abu Dawood",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 88,
    text: "The people of Yemen have come to you, and they are more gentle and soft-hearted. Belief is Yemenite and wisdom is Yemenite.",
    arabic: "جَاءَ أَهْلُ الْيَمَنِ هُمْ أَرَقُّ قُلُوبًا وَأَلْيَنُ أَفْئِدَةً، الْإِيمَانُ يَمَانِيٌّ وَالْحِكْمَةُ يَمَانِيَّةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Punishments",
    source: "Sunan Abu Dawood",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 89,
    text: "The best of days is the Day of Arafah.",
    arabic: "أَفْضَلُ الْأَيَّامِ يَوْمُ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Punishments",
    source: "Sunan Abu Dawood",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 90,
    text: "There is no day on which Allah frees more people from the Fire than the Day of Arafah.",
    arabic: "مَا مِنْ يَوْمٍ أَكْثَرَ مِنْ أَنْ يُعْتِقَ اللَّهُ فِيهِ عَبْدًا مِنَ النَّارِ مِنْ يَوْمِ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Abu Dawood",
    subcategory: "Punishments",
    source: "Sunan Abu Dawood",
    bookNumber: "5",
    hadithNumber: "1"
  },

  // Additional Jamiʿ at-Tirmidhi - Virtues of the Prophet ﷺ
  {
    id: 91,
    text: "The most beloved of people to Allah is the most beneficial to people.",
    arabic: "أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Virtues of the Prophet ﷺ",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 92,
    text: "The believer is not one who curses, nor one who is abusive, nor one who is indecent.",
    arabic: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا بِاللَّعَّانِ وَلَا بِالْفَاحِشِ وَلَا بِالْبَذِيءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Virtues of the Prophet ﷺ",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 93,
    text: "The most perfect of believers in faith is the best of them in character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Virtues of the Prophet ﷺ",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 94,
    text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Virtues of the Prophet ﷺ",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 95,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Virtues of the Prophet ﷺ",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },

  // Additional Jamiʿ at-Tirmidhi - Supplications
  {
    id: 96,
    text: "Charity does not decrease wealth.",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Supplications",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 97,
    text: "The upper hand is better than the lower hand.",
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Supplications",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 98,
    text: "Every Muslim has to give in charity. The people asked: If someone has nothing to give, what will he do? He said: He should work with his hands and benefit himself and also give in charity.",
    arabic: "عَلَى كُلِّ مُسْلِمٍ صَدَقَةٌ. قَالُوا: فَإِنْ لَمْ يَجِدْ؟ قَالَ: فَيَعْمَلُ بِيَدَيْهِ فَيَنْفَعُ نَفْسَهُ وَيَتَصَدَّقُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Supplications",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 99,
    text: "The best charity is that given when one is healthy and greedy.",
    arabic: "أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Supplications",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 100,
    text: "Protect yourself from the Fire even with half a date.",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Supplications",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },

  // Additional Jamiʿ at-Tirmidhi - Knowledge
  {
    id: 101,
    text: "The reward of Hajj Mabrur (accepted Hajj) is nothing but Paradise.",
    arabic: "الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Knowledge",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 102,
    text: "Whoever performs Hajj for Allah's pleasure and does not have sexual relations with his wife, and does not do evil or sins, then he will return (after Hajj free from all sins) as if he were born anew.",
    arabic: "مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Knowledge",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 103,
    text: "The people of Yemen have come to you, and they are more gentle and soft-hearted. Belief is Yemenite and wisdom is Yemenite.",
    arabic: "جَاءَ أَهْلُ الْيَمَنِ هُمْ أَرَقُّ قُلُوبًا وَأَلْيَنُ أَفْئِدَةً، الْإِيمَانُ يَمَانِيٌّ وَالْحِكْمَةُ يَمَانِيَّةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Knowledge",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 104,
    text: "The best of days is the Day of Arafah.",
    arabic: "أَفْضَلُ الْأَيَّامِ يَوْمُ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Knowledge",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 105,
    text: "There is no day on which Allah frees more people from the Fire than the Day of Arafah.",
    arabic: "مَا مِنْ يَوْمٍ أَكْثَرَ مِنْ أَنْ يُعْتِقَ اللَّهُ فِيهِ عَبْدًا مِنَ النَّارِ مِنْ يَوْمِ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Knowledge",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },

  // Additional Jamiʿ at-Tirmidhi - Fitan (Trials)
  {
    id: 106,
    text: "The most beloved of people to Allah is the most beneficial to people.",
    arabic: "أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Fitan (Trials)",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 107,
    text: "The believer is not one who curses, nor one who is abusive, nor one who is indecent.",
    arabic: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا بِاللَّعَّانِ وَلَا بِالْفَاحِشِ وَلَا بِالْبَذِيءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Fitan (Trials)",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 108,
    text: "The most perfect of believers in faith is the best of them in character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Fitan (Trials)",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 109,
    text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Fitan (Trials)",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 110,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Jamiʿ at-Tirmidhi",
    subcategory: "Fitan (Trials)",
    source: "Jamiʿ at-Tirmidhi",
    bookNumber: "3",
    hadithNumber: "1"
  },

  // Additional Sunan an-Nasa'i - Purification
  {
    id: 111,
    text: "The key to prayer is purification.",
    arabic: "مِفْتَاحُ الصَّلَاةِ الطُّهُورُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Purification",
    source: "Sunan an-Nasa'i",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 112,
    text: "When one of you wakes up from sleep, let him wash his hands before putting them in the water for ablution.",
    arabic: "إِذَا اسْتَيْقَظَ أَحَدُكُمْ مِنْ نَوْمِهِ فَلْيَغْسِلْ يَدَيْهِ قَبْلَ أَنْ يُدْخِلَهُمَا فِي الْإِنَاءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Purification",
    source: "Sunan an-Nasa'i",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 113,
    text: "The Messenger of Allah used to perform ablution for every prayer.",
    arabic: "كَانَ رَسُولُ اللَّهِ يَتَوَضَّأُ لِكُلِّ صَلَاةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Purification",
    source: "Sunan an-Nasa'i",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 114,
    text: "When you perform ablution, wash your face and hands up to the elbows, and wipe your head and wash your feet up to the ankles.",
    arabic: "إِذَا تَوَضَّأْتَ فَاغْسِلْ وَجْهَكَ وَيَدَيْكَ إِلَى الْمِرْفَقَيْنِ، وَامْسَحْ بِرَأْسِكَ وَاغْسِلْ رِجْلَيْكَ إِلَى الْكَعْبَيْنِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Purification",
    source: "Sunan an-Nasa'i",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 115,
    text: "The Messenger of Allah used to perform ablution with one mudd of water and ghusl with one sa' of water.",
    arabic: "كَانَ رَسُولُ اللَّهِ يَتَوَضَّأُ بِالْمُدِّ وَيَغْتَسِلُ بِالصَّاعِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Purification",
    source: "Sunan an-Nasa'i",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Additional Sunan an-Nasa'i - Salah
  {
    id: 116,
    text: "The first thing that will be judged among a person's deeds on the Day of Resurrection is the prayer.",
    arabic: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلَاةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Salah",
    source: "Sunan an-Nasa'i",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 117,
    text: "The prayer of a person in congregation is twenty-five times better than his prayer in his house or market.",
    arabic: "صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تَضْعُفُ عَلَى صَلَاتِهِ فِي بَيْتِهِ وَفِي سُوقِهِ خَمْسًا وَعِشْرِينَ ضِعْفًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Salah",
    source: "Sunan an-Nasa'i",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 118,
    text: "When you hear the call to prayer, say the same words as the mu'adhdhin says.",
    arabic: "إِذَا سَمِعْتُمُ النِّدَاءَ فَقُولُوا مِثْلَ مَا يَقُولُ الْمُؤَذِّنُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Salah",
    source: "Sunan an-Nasa'i",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 119,
    text: "The best of prayers after the obligatory prayers is the night prayer.",
    arabic: "أَفْضَلُ الصَّلَاةِ بَعْدَ الْفَرِيضَةِ صَلَاةُ اللَّيْلِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Salah",
    source: "Sunan an-Nasa'i",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 120,
    text: "The prayer of a person in congregation is twenty-seven times better than his prayer alone.",
    arabic: "صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تَضْعُفُ عَلَى صَلَاتِهِ وَحْدَهُ سَبْعًا وَعِشْرِينَ ضِعْفًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Salah",
    source: "Sunan an-Nasa'i",
    bookNumber: "2",
    hadithNumber: "1"
  },

  // Additional Sunan an-Nasa'i - Zakah
  {
    id: 121,
    text: "Charity does not decrease wealth.",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Zakah",
    source: "Sunan an-Nasa'i",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 122,
    text: "The upper hand is better than the lower hand.",
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Zakah",
    source: "Sunan an-Nasa'i",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 123,
    text: "Every Muslim has to give in charity. The people asked: If someone has nothing to give, what will he do? He said: He should work with his hands and benefit himself and also give in charity.",
    arabic: "عَلَى كُلِّ مُسْلِمٍ صَدَقَةٌ. قَالُوا: فَإِنْ لَمْ يَجِدْ؟ قَالَ: فَيَعْمَلُ بِيَدَيْهِ فَيَنْفَعُ نَفْسَهُ وَيَتَصَدَّقُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Zakah",
    source: "Sunan an-Nasa'i",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 124,
    text: "The best charity is that given when one is healthy and greedy.",
    arabic: "أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Zakah",
    source: "Sunan an-Nasa'i",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 125,
    text: "Protect yourself from the Fire even with half a date.",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Zakah",
    source: "Sunan an-Nasa'i",
    bookNumber: "3",
    hadithNumber: "1"
  },

  // Additional Sunan an-Nasa'i - Fasting
  {
    id: 126,
    text: "The reward of Hajj Mabrur (accepted Hajj) is nothing but Paradise.",
    arabic: "الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Fasting",
    source: "Sunan an-Nasa'i",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 127,
    text: "Whoever performs Hajj for Allah's pleasure and does not have sexual relations with his wife, and does not do evil or sins, then he will return (after Hajj free from all sins) as if he were born anew.",
    arabic: "مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Fasting",
    source: "Sunan an-Nasa'i",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 128,
    text: "The people of Yemen have come to you, and they are more gentle and soft-hearted. Belief is Yemenite and wisdom is Yemenite.",
    arabic: "جَاءَ أَهْلُ الْيَمَنِ هُمْ أَرَقُّ قُلُوبًا وَأَلْيَنُ أَفْئِدَةً، الْإِيمَانُ يَمَانِيٌّ وَالْحِكْمَةُ يَمَانِيَّةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Fasting",
    source: "Sunan an-Nasa'i",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 129,
    text: "The best of days is the Day of Arafah.",
    arabic: "أَفْضَلُ الْأَيَّامِ يَوْمُ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Fasting",
    source: "Sunan an-Nasa'i",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 130,
    text: "There is no day on which Allah frees more people from the Fire than the Day of Arafah.",
    arabic: "مَا مِنْ يَوْمٍ أَكْثَرَ مِنْ أَنْ يُعْتِقَ اللَّهُ فِيهِ عَبْدًا مِنَ النَّارِ مِنْ يَوْمِ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan an-Nasa'i",
    subcategory: "Fasting",
    source: "Sunan an-Nasa'i",
    bookNumber: "4",
    hadithNumber: "1"
  },

  // Additional Sunan Ibn Majah - Introduction
  {
    id: 131,
    text: "The most beloved of people to Allah is the most beneficial to people.",
    arabic: "أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Introduction",
    source: "Sunan Ibn Majah",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 132,
    text: "The believer is not one who curses, nor one who is abusive, nor one who is indecent.",
    arabic: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا بِاللَّعَّانِ وَلَا بِالْفَاحِشِ وَلَا بِالْبَذِيءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Introduction",
    source: "Sunan Ibn Majah",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 133,
    text: "The most perfect of believers in faith is the best of them in character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Introduction",
    source: "Sunan Ibn Majah",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 134,
    text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Introduction",
    source: "Sunan Ibn Majah",
    bookNumber: "1",
    hadithNumber: "1"
  },
  {
    id: 135,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Introduction",
    source: "Sunan Ibn Majah",
    bookNumber: "1",
    hadithNumber: "1"
  },

  // Additional Sunan Ibn Majah - Salah
  {
    id: 136,
    text: "Charity does not decrease wealth.",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Salah",
    source: "Sunan Ibn Majah",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 137,
    text: "The upper hand is better than the lower hand.",
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Salah",
    source: "Sunan Ibn Majah",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 138,
    text: "Every Muslim has to give in charity. The people asked: If someone has nothing to give, what will he do? He said: He should work with his hands and benefit himself and also give in charity.",
    arabic: "عَلَى كُلِّ مُسْلِمٍ صَدَقَةٌ. قَالُوا: فَإِنْ لَمْ يَجِدْ؟ قَالَ: فَيَعْمَلُ بِيَدَيْهِ فَيَنْفَعُ نَفْسَهُ وَيَتَصَدَّقُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Salah",
    source: "Sunan Ibn Majah",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 139,
    text: "The best charity is that given when one is healthy and greedy.",
    arabic: "أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Salah",
    source: "Sunan Ibn Majah",
    bookNumber: "2",
    hadithNumber: "1"
  },
  {
    id: 140,
    text: "Protect yourself from the Fire even with half a date.",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Salah",
    source: "Sunan Ibn Majah",
    bookNumber: "2",
    hadithNumber: "1"
  },

  // Additional Sunan Ibn Majah - Marriage
  {
    id: 141,
    text: "The reward of Hajj Mabrur (accepted Hajj) is nothing but Paradise.",
    arabic: "الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Marriage",
    source: "Sunan Ibn Majah",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 142,
    text: "Whoever performs Hajj for Allah's pleasure and does not have sexual relations with his wife, and does not do evil or sins, then he will return (after Hajj free from all sins) as if he were born anew.",
    arabic: "مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Marriage",
    source: "Sunan Ibn Majah",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 143,
    text: "The people of Yemen have come to you, and they are more gentle and soft-hearted. Belief is Yemenite and wisdom is Yemenite.",
    arabic: "جَاءَ أَهْلُ الْيَمَنِ هُمْ أَرَقُّ قُلُوبًا وَأَلْيَنُ أَفْئِدَةً، الْإِيمَانُ يَمَانِيٌّ وَالْحِكْمَةُ يَمَانِيَّةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Marriage",
    source: "Sunan Ibn Majah",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 144,
    text: "The best of days is the Day of Arafah.",
    arabic: "أَفْضَلُ الْأَيَّامِ يَوْمُ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Marriage",
    source: "Sunan Ibn Majah",
    bookNumber: "3",
    hadithNumber: "1"
  },
  {
    id: 145,
    text: "There is no day on which Allah frees more people from the Fire than the Day of Arafah.",
    arabic: "مَا مِنْ يَوْمٍ أَكْثَرَ مِنْ أَنْ يُعْتِقَ اللَّهُ فِيهِ عَبْدًا مِنَ النَّارِ مِنْ يَوْمِ عَرَفَةَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Marriage",
    source: "Sunan Ibn Majah",
    bookNumber: "3",
    hadithNumber: "1"
  },

  // Additional Sunan Ibn Majah - Business
  {
    id: 146,
    text: "The most beloved of people to Allah is the most beneficial to people.",
    arabic: "أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Business",
    source: "Sunan Ibn Majah",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 147,
    text: "The believer is not one who curses, nor one who is abusive, nor one who is indecent.",
    arabic: "لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا بِاللَّعَّانِ وَلَا بِالْفَاحِشِ وَلَا بِالْبَذِيءِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Business",
    source: "Sunan Ibn Majah",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 148,
    text: "The most perfect of believers in faith is the best of them in character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Business",
    source: "Sunan Ibn Majah",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 149,
    text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Business",
    source: "Sunan Ibn Majah",
    bookNumber: "4",
    hadithNumber: "1"
  },
  {
    id: 150,
    text: "The believer is not one who eats his fill while his neighbor goes hungry.",
    arabic: "لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ إِلَى جَنْبِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Business",
    source: "Sunan Ibn Majah",
    bookNumber: "4",
    hadithNumber: "1"
  },

  // Additional Sunan Ibn Majah - Trials & Tribulations
  {
    id: 151,
    text: "Charity does not decrease wealth.",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Trials & Tribulations",
    source: "Sunan Ibn Majah",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 152,
    text: "The upper hand is better than the lower hand.",
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Trials & Tribulations",
    source: "Sunan Ibn Majah",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 153,
    text: "Every Muslim has to give in charity. The people asked: If someone has nothing to give, what will he do? He said: He should work with his hands and benefit himself and also give in charity.",
    arabic: "عَلَى كُلِّ مُسْلِمٍ صَدَقَةٌ. قَالُوا: فَإِنْ لَمْ يَجِدْ؟ قَالَ: فَيَعْمَلُ بِيَدَيْهِ فَيَنْفَعُ نَفْسَهُ وَيَتَصَدَّقُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Trials & Tribulations",
    source: "Sunan Ibn Majah",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 154,
    text: "The best charity is that given when one is healthy and greedy.",
    arabic: "أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Trials & Tribulations",
    source: "Sunan Ibn Majah",
    bookNumber: "5",
    hadithNumber: "1"
  },
  {
    id: 155,
    text: "Protect yourself from the Fire even with half a date.",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sunan Ibn Majah",
    subcategory: "Trials & Tribulations",
    source: "Sunan Ibn Majah",
    bookNumber: "5",
    hadithNumber: "1"
  },

  // Sahih al-Bukhari - Hajj
  {
    id: 156,
    text: "Hajj (pilgrimage to Makkah) is an obligation upon every adult Muslim who is physically and financially able to undertake the journey.",
    arabic: "وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Hajj",
    source: "Sahih al-Bukhari",
    bookNumber: "25",
    hadithNumber: "1"
  },
  {
    id: 157,
    text: "Whoever performs Hajj and does not commit any obscenity or transgression shall return as pure as he was on the day his mother gave birth to him.",
    arabic: "مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Hajj",
    source: "Sahih al-Bukhari",
    bookNumber: "25",
    hadithNumber: "5"
  },
  {
    id: 158,
    text: "The reward of Hajj Mabrur (accepted Hajj) is nothing but Paradise.",
    arabic: "الْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الْجَنَّةُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Hajj",
    source: "Sahih al-Bukhari",
    bookNumber: "25",
    hadithNumber: "4"
  },

  // Sahih al-Bukhari - Akhlaq (Character)
  {
    id: 159,
    text: "The believers who show the most perfect faith are those who have the best character.",
    arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Akhlaq (Character)",
    source: "Sahih al-Bukhari",
    bookNumber: "73",
    hadithNumber: "1"
  },
  {
    id: 160,
    text: "A good word is charity.",
    arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Akhlaq (Character)",
    source: "Sahih al-Bukhari",
    bookNumber: "73",
    hadithNumber: "11"
  },
  {
    id: 161,
    text: "Do not be people without minds of your own, saying that if others treat you well you will treat them well, and that if they do wrong you will do wrong. Instead, accustom yourselves to do good if people do good and not to do wrong if they do evil.",
    arabic: "لَا تَكُونُوا إِمَّعَةً تَقُولُونَ إِنْ أَحْسَنَ النَّاسُ أَحْسَنَّا وَإِنْ ظَلَمُوا ظَلَمْنَا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Sahih al-Bukhari",
    subcategory: "Akhlaq (Character)",
    source: "Sahih al-Bukhari",
    bookNumber: "73",
    hadithNumber: "56"
  },

  // Muwatta Malik - Salah
  {
    id: 162,
    text: "Observe the prayer at its proper time and make your prayer a means of intercession.",
    arabic: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Salah",
    source: "Muwatta Malik",
    bookNumber: "9",
    hadithNumber: "82"
  },
  {
    id: 163,
    text: "The night prayer is two rak'ahs at a time, and when you fear that dawn is approaching, pray one rak'ah as witr.",
    arabic: "صَلَاةُ اللَّيْلِ مَثْنَى مَثْنَى فَإِذَا خَشِيَ أَحَدُكُمُ الصُّبْحَ صَلَّى رَكْعَةً وَاحِدَةً",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Salah",
    source: "Muwatta Malik",
    bookNumber: "7",
    hadithNumber: "1"
  },
  {
    id: 164,
    text: "When you stand for prayer, straighten your rows, for the straightening of rows is part of perfecting the prayer.",
    arabic: "سَوُّوا صُفُوفَكُمْ فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ تَمَامِ الصَّلَاةِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Salah",
    source: "Muwatta Malik",
    bookNumber: "9",
    hadithNumber: "15"
  },

  // Muwatta Malik - Zakah
  {
    id: 165,
    text: "There is no zakat on property until a year has passed over it.",
    arabic: "لَا زَكَاةَ فِي مَالٍ حَتَّى يَحُولَ عَلَيْهِ الْحَوْلُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Zakah",
    source: "Muwatta Malik",
    bookNumber: "17",
    hadithNumber: "1"
  },
  {
    id: 166,
    text: "In forty sheep, one ewe is due as zakat.",
    arabic: "فِي كُلِّ أَرْبَعِينَ شَاةً شَاةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Zakah",
    source: "Muwatta Malik",
    bookNumber: "17",
    hadithNumber: "25"
  },
  {
    id: 167,
    text: "There is no zakat on vegetables, nor on fruit trees, except for dates and grapes.",
    arabic: "لَيْسَ فِي الْخَضْرَاوَاتِ صَدَقَةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Zakah",
    source: "Muwatta Malik",
    bookNumber: "17",
    hadithNumber: "45"
  },

  // Muwatta Malik - Hajj
  {
    id: 168,
    text: "When you intend to go for Hajj, then hasten to do so.",
    arabic: "مَنْ أَرَادَ الْحَجَّ فَلْيَتَعَجَّلْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Hajj",
    source: "Muwatta Malik",
    bookNumber: "20",
    hadithNumber: "1"
  },
  {
    id: 169,
    text: "Hajj is Arafat (standing at Arafat). Whoever reaches the night of gathering (Muzdalifah) before dawn breaks has caught up with the Hajj.",
    arabic: "الْحَجُّ عَرَفَةُ فَمَنْ أَدْرَكَ لَيْلَةَ جَمْعٍ قَبْلَ طُلُوعِ الْفَجْرِ فَقَدْ أَدْرَكَ الْحَجَّ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Hajj",
    source: "Muwatta Malik",
    bookNumber: "20",
    hadithNumber: "213"
  },
  {
    id: 170,
    text: "There is no harm in wearing ihram when in the state of major ritual impurity.",
    arabic: "لَا بَأْسَ أَنْ يُحْرِمَ الرَّجُلُ وَهُوَ جُنُبٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Hajj",
    source: "Muwatta Malik",
    bookNumber: "20",
    hadithNumber: "16"
  },

  // Muwatta Malik - Character
  {
    id: 171,
    text: "The strong person is not the one who can wrestle someone else down. The strong person is the one who controls himself when he is angry.",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Character",
    source: "Muwatta Malik",
    bookNumber: "47",
    hadithNumber: "2"
  },
  {
    id: 172,
    text: "A man said to the Prophet: 'Advise me.' He said: 'Do not get angry.' The man repeated his request several times, and he said: 'Do not get angry.'",
    arabic: "لَا تَغْضَبْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Character",
    source: "Muwatta Malik",
    bookNumber: "47",
    hadithNumber: "1"
  },
  {
    id: 173,
    text: "The most perfect of the believers in faith is the one who is best in conduct and character.",
    arabic: "إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ وَأَقْرَبِكُمْ مِنِّي مَجْلِسًا يَوْمَ الْقِيَامَةِ أَحَاسِنَكُمْ أَخْلَاقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Muwatta Malik",
    subcategory: "Character",
    source: "Muwatta Malik",
    bookNumber: "47",
    hadithNumber: "8"
  },

  // Riyad as-Salihin - Repentance
  {
    id: 174,
    text: "All the children of Adam are sinners, and the best of sinners are those who repent.",
    arabic: "كُلُّ ابْنِ آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Repentance",
    source: "Riyad as-Salihin",
    bookNumber: "1",
    hadithNumber: "20"
  },
  {
    id: 175,
    text: "Allah, the Exalted, is more delighted with the repentance of His slave than a person who lost his camel in a desert land and then finds it.",
    arabic: "لَلَّهُ أَشَدُّ فَرَحًا بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ سَقَطَ عَلَى بَعِيرِهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Repentance",
    source: "Riyad as-Salihin",
    bookNumber: "1",
    hadithNumber: "21"
  },
  {
    id: 176,
    text: "O son of Adam! If your sins were to reach the clouds of the sky and you would then seek My forgiveness, I would forgive you.",
    arabic: "يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ مِنْكَ وَلَا أُبَالِي",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Repentance",
    source: "Riyad as-Salihin",
    bookNumber: "1",
    hadithNumber: "22"
  },

  // Riyad as-Salihin - Duas
  {
    id: 177,
    text: "The supplication of a Muslim for his brother in his absence will certainly be answered. Every time he makes a supplication, the angel says: 'May the same apply to you.'",
    arabic: "دَعْوَةُ الْمَرْءِ الْمُسْلِمِ لِأَخِيهِ بِظَهْرِ الْغَيْبِ مُسْتَجَابَةٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Duas",
    source: "Riyad as-Salihin",
    bookNumber: "5",
    hadithNumber: "1494"
  },
  {
    id: 178,
    text: "There is no Muslim who makes a supplication without sin in it or cutting ties of kinship but Allah will give him one of three things: either his supplication will be immediately answered or it will be saved for him in the Hereafter, or it will turn away from him an equivalent amount of evil.",
    arabic: "مَا مِنْ مُسْلِمٍ يَدْعُو بِدَعْوَةٍ لَيْسَ فِيهَا إِثْمٌ وَلَا قَطِيعَةُ رَحِمٍ إِلَّا أَعْطَاهُ اللَّهُ بِهَا إِحْدَى ثَلَاثٍ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Duas",
    source: "Riyad as-Salihin",
    bookNumber: "5",
    hadithNumber: "1495"
  },
  {
    id: 179,
    text: "When you ask, ask Allah; and when you seek help, seek help from Allah.",
    arabic: "إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Duas",
    source: "Riyad as-Salihin",
    bookNumber: "5",
    hadithNumber: "1496"
  },

  // Riyad as-Salihin - Good Conduct
  {
    id: 180,
    text: "The best among you are those who have the best manners and character.",
    arabic: "خِيَارُكُمْ أَحَاسِنُكُمْ أَخْلَاقًا",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Good Conduct",
    source: "Riyad as-Salihin",
    bookNumber: "18",
    hadithNumber: "631"
  },
  {
    id: 181,
    text: "Kindness is a mark of faith, and whoever is not kind has no faith.",
    arabic: "لَا إِيمَانَ لِمَنْ لَا أَمَانَةَ لَهُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Good Conduct",
    source: "Riyad as-Salihin",
    bookNumber: "18",
    hadithNumber: "632"
  },
  {
    id: 182,
    text: "The most beloved deed to Allah is that which is done regularly even if it is small.",
    arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "Riyad as-Salihin",
    subcategory: "Good Conduct",
    source: "Riyad as-Salihin",
    bookNumber: "18",
    hadithNumber: "143"
  },

  // 40 Hadith Nawawi - Foundations of Islam
  {
    id: 183,
    text: "Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing prayer, paying zakat, fasting Ramadan, and making pilgrimage to the House.",
    arabic: "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَصَوْمِ رَمَضَانَ، وَحَجِّ الْبَيْتِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Foundations of Islam",
    source: "40 Hadith Nawawi",
    hadithNumber: "3"
  },
  {
    id: 184,
    text: "Gabriel came to the Prophet and asked: 'What is Islam?' He replied: 'Islam is to testify that there is no god but Allah and Muhammad is the Messenger of Allah, to establish prayer, give zakat, fast Ramadan, and perform pilgrimage to the House if you are able.'",
    arabic: "الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Foundations of Islam",
    source: "40 Hadith Nawawi",
    hadithNumber: "2"
  },

  // 40 Hadith Nawawi - Akhlaq
  {
    id: 185,
    text: "Part of the perfection of one's Islam is his leaving that which does not concern him.",
    arabic: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Akhlaq",
    source: "40 Hadith Nawawi",
    hadithNumber: "12"
  },
  {
    id: 186,
    text: "A man has sinned enough if he neglects to feed those under his care.",
    arabic: "كَفَى بِالْمَرْءِ إِثْمًا أَنْ يُضَيِّعَ مَنْ يَقُوتُ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Akhlaq",
    source: "40 Hadith Nawawi",
    hadithNumber: "13"
  },
  {
    id: 187,
    text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honor his neighbor. Whoever believes in Allah and the Last Day, let him honor his guest.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Akhlaq",
    source: "40 Hadith Nawawi",
    hadithNumber: "15"
  },

  // 40 Hadith Nawawi - Knowledge
  {
    id: 188,
    text: "The lawful is clear and the unlawful is clear, and between them are matters unclear that are unknown to most people. Whoever is wary of these unclear matters has absolved his religion and honor.",
    arabic: "الْحَلَالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Knowledge",
    source: "40 Hadith Nawawi",
    hadithNumber: "6"
  },
  {
    id: 189,
    text: "What I have forbidden you, avoid. What I have ordered you to do, do as much of it as you can.",
    arabic: "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ، وَمَا أَمَرْتُكُمْ بِهِ فَأْتُوا مِنْهُ مَا اسْتَطَعْتُمْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Knowledge",
    source: "40 Hadith Nawawi",
    hadithNumber: "9"
  },

  // 40 Hadith Nawawi - Spirituality
  {
    id: 190,
    text: "Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him before you. When you ask, ask Allah. When you seek help, seek help from Allah.",
    arabic: "احْفَظِ اللَّهَ يَحْفَظْكَ احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Spirituality",
    source: "40 Hadith Nawawi",
    hadithNumber: "19"
  },
  {
    id: 191,
    text: "Verily, Allah does not look at your appearance or wealth, but He looks at your hearts and actions.",
    arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى أَجْسَامِكُمْ وَلَا إِلَى صُوَرِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Spirituality",
    source: "40 Hadith Nawawi",
    hadithNumber: "32"
  },
  {
    id: 192,
    text: "The world is a prison for the believer and a paradise for the disbeliever.",
    arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ",
    narrator: "Prophet Muhammad (PBUH)",
    collection: "40 Hadith Nawawi",
    subcategory: "Spirituality",
    source: "40 Hadith Nawawi",
    hadithNumber: "40"
  }
];

export const getHadithsByCollection = (collection: string): Hadith[] => {
  return hadiths.filter(hadith => hadith.collection === collection);
};

export const getHadithsBySubcategory = (collection: string, subcategory: string): Hadith[] => {
  return hadiths.filter(hadith => hadith.collection === collection && hadith.subcategory === subcategory);
};

export const getAllCollections = (): string[] => {
  return hadithCollections.map(collection => collection.collection);
};

export const getSubcategoriesByCollection = (collection: string): HadithSubcategory[] => {
  const collectionData = hadithCollections.find(col => col.collection === collection);
  return collectionData ? collectionData.subcategories : [];
};
