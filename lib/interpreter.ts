import { WORDS, Category } from "./word";

export const getBarrettAnalysis = (selectedWordIds: string[]) => {
  const selectedWords = selectedWordIds.map(id => WORDS.find(w => w.id === id)).filter(Boolean) as { id: string; word: string; category: Category }[];
  
  // 1. Potentially Limiting Values (PLVs) / Entropi
  const plvCategories = ["Tekanan", "Kecemasan"];
  const limitingWords = selectedWords.filter(w => plvCategories.includes(w.category));
  const entropyScore = (limitingWords.length / 10) * 100;
  
  let entropyLevel = { index: 0, label: "Healthy", color: "bg-[#84cc16]", text: "text-[#84cc16]" };
  if (entropyScore >= 29) entropyLevel = { index: 3, label: "Critical", color: "bg-[#ef4444]", text: "text-[#ef4444]" };
  else if (entropyScore >= 20) entropyLevel = { index: 2, label: "Significant Issues", color: "bg-[#f97316]", text: "text-[#f97316]" };
  else if (entropyScore >= 14) entropyLevel = { index: 1, label: "Requiring Focus", color: "bg-[#eab308]", text: "text-[#eab308]" };

  // 2. Balance Index (3 Zona)
  const foundationCats = ["Ketangguhan", "Tekanan", "Empati", "Kontrol Diri", "Keinginan", "Kecemasan"];
  const evolutionCats = ["Kepercayaan Diri", "Energi"];
  const impactCats = ["Keaslian", "Fokus"];

  const countGroup = (group: string[]) => selectedWords.filter(w => group.includes(w.category)).length;
  const balance = {
    foundation: (countGroup(foundationCats) / 10) * 100,
    evolution: (countGroup(evolutionCats) / 10) * 100,
    impact: (countGroup(impactCats) / 10) * 100,
  };

  // 3. Organisational Perspectives (Process, People, Purpose)
  const processCats = ["Kontrol Diri", "Fokus", "Ketangguhan"];
  const peopleCats = ["Empati", "Keaslian", "Kecemasan"];
  const purposeCats = ["Keinginan", "Kepercayaan Diri", "Energi", "Tekanan"];

  const perspectives = {
    process: (countGroup(processCats) / 10) * 100,
    people: (countGroup(peopleCats) / 10) * 100,
    purpose: (countGroup(purposeCats) / 10) * 100,
  };

  // 4. Matrix 7 Levels (Hourglass)
  // Level 1: Survival, 2: Relationships, 3: Performance, 4: Evolution, 5: Alignment, 6: Collaboration, 7: Contribution
  const levelMapping: Record<Category, number> = {
    "Tekanan": 1, "Kecemasan": 1,
    "Empati": 2,
    "Kontrol Diri": 3, "Keinginan": 3,
    "Ketangguhan": 4, "Kepercayaan Diri": 4,
    "Keaslian": 5,
    "Energi": 6,
    "Fokus": 7
  };

  const levels = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  selectedWords.forEach(w => {
    const lvl = levelMapping[w.category];
    levels[lvl as keyof typeof levels] += 1;
  });

  const levelPercentages = Object.keys(levels).reduce((acc, key) => {
    acc[Number(key)] = (levels[Number(key) as keyof typeof levels] / 10) * 100;
    return acc;
  }, {} as Record<number, number>);

  // 5. Alignment (Mock data kesesuaian dengan OSIS)
  // Menghitung berapa banyak kata positif yang dipilih
  const alignmentScore = 10 - limitingWords.length; 

  const healthScore = Math.max(0, 100 - (entropyScore * 2.5));

  return {
    entropyScore, entropyLevel, balance, perspectives,
    levels: levelPercentages, alignmentScore,
    limitingWords: limitingWords.map(w => w.word),
    topValues: selectedWords.filter(w => !plvCategories.includes(w.category)).map(w => w.word),
    healthScore
  };
};