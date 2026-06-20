// ============================================================
// LEARN FIGHT — Localization (Thai / English)
// ============================================================

const translations = {
  // Main Menu
  game_title: { th: 'LEARN FIGHT', en: 'LEARN FIGHT' },
  start_game: { th: 'เริ่มเกม', en: 'START GAME' },
  characters: { th: 'ตัวละคร', en: 'CHARACTERS' },
  create_character: { th: 'สร้างตัวละคร', en: 'CREATE CHARACTER' },
  settings: { th: 'ตั้งค่า', en: 'SETTINGS' },
  exit: { th: 'ออกจากเกม', en: 'EXIT' },

  // Character Creation
  character_name: { th: 'ชื่อนักสู้', en: 'Fighter Name' },
  select_skin: { th: 'เลือกสกิน', en: 'Select Skin' },
  select_ability: { th: 'เลือกความสามารถพิเศษ', en: 'Select Special Ability' },
  create: { th: 'สร้างตัวละคร', en: 'Create Character' },
  special_abilities: { th: 'ความสามารถพิเศษ', en: 'Special Abilities' },

  // Character List
  fighter_list: { th: 'รายชื่อนักสู้', en: 'Fighter Roster' },
  no_fighters: { th: 'ยังไม่มีนักสู้ สร้างเลย!', en: 'No fighters yet. Create one!' },
  delete: { th: 'ลบ', en: 'Delete' },

  // Stats
  stats: { th: 'สถานะ', en: 'Stats' },
  punch_power: { th: 'พลังหมัด', en: 'Punch Power' },
  kick_power: { th: 'พลังเตะ', en: 'Kick Power' },
  reaction_speed: { th: 'การตอบสนอง', en: 'Reaction Speed' },
  endurance: { th: 'ความทนทาน', en: 'Endurance' },
  max_stat: { th: 'สูงสุด 7', en: 'Max 7' },

  // Training
  training: { th: 'การฝึก', en: 'Training' },
  punch_training: { th: 'ฝึกต่อย', en: 'Punch Training' },
  kick_training: { th: 'ฝึกเตะ', en: 'Kick Training' },
  reaction_training: { th: 'ฝึกการตอบสนอง', en: 'Reaction Training' },
  endurance_training: { th: 'รับหมัดคู่ต่อสู้', en: 'Endurance Training' },
  sessions_remaining: { th: 'ครั้งที่', en: 'Session' },
  training_complete: { th: 'ฝึกเสร็จแล้ว!', en: 'Training Complete!' },
  stat_increased: { th: 'สถานะเพิ่มขึ้น!', en: 'Stat Increased!' },
  max_sessions_reached: { th: 'ฝึกครบ 20 ครั้งแล้ว', en: 'Max 20 sessions reached' },
  seconds: { th: 'วินาที', en: 'seconds' },

  // Fight
  fight: { th: 'ต่อสู้', en: 'FIGHT' },
  select_opponent: { th: 'เลือกคู่ต่อสู้', en: 'Select Opponent' },
  start_fight: { th: 'เริ่มต่อสู้', en: 'Start Fight' },
  vs: { th: 'VS', en: 'VS' },
  round: { th: 'ยก', en: 'Round' },
  ko: { th: 'น็อค', en: 'KO' },
  tko: { th: 'ทีเคโอ', en: 'TKO' },
  decision: { th: 'คะแนน', en: 'Decision' },

  // Results
  victory: { th: 'ชนะ', en: 'VICTORY' },
  defeat: { th: 'แพ้', en: 'DEFEAT' },
  rematch: { th: 'แข่งใหม่', en: 'Rematch' },
  home: { th: 'หน้าหลัก', en: 'Home' },
  retry: { th: 'ลองใหม่', en: 'Retry' },

  // Navigation
  back: { th: 'ย้อนกลับ', en: 'Back' },
  train: { th: 'การฝึก', en: 'TRAIN' },

  // Settings
  language: { th: 'ภาษา', en: 'Language' },
  sfx_volume: { th: 'เสียงเอฟเฟกต์', en: 'SFX Volume' },
  music_volume: { th: 'เสียงเพลง', en: 'Music Volume' },
  quality: { th: 'คุณภาพกราฟิก', en: 'Graphics Quality' },
  low: { th: 'ต่ำ', en: 'Low' },
  medium: { th: 'กลาง', en: 'Medium' },
  high: { th: 'สูง', en: 'High' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: 'th' | 'en' = 'th'): string {
  return translations[key]?.[lang] ?? key;
}

export default translations;
