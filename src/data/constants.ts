// ============================================================
// LEARN FIGHT — Abilities Data
// ============================================================
import { Ability } from '@/types/game';

export const ABILITIES: Ability[] = [
  {
    id: 'iron_fist',
    nameTH: 'หมัดเหล็ก',
    nameEN: 'Iron Fist',
    descriptionTH: 'เพิ่มพลังหมัดอย่างมหาศาล',
    descriptionEN: 'Massively increases punch damage',
    icon: '👊',
    color: '#FF4444',
  },
  {
    id: 'iron_kick',
    nameTH: 'เตะเหล็ก',
    nameEN: 'Iron Kick',
    descriptionTH: 'เพิ่มพลังเตะอย่างมหาศาล',
    descriptionEN: 'Massively increases kick damage',
    icon: '🦵',
    color: '#FF6B35',
  },
  {
    id: 'iron_body',
    nameTH: 'ร่างเหล็ก',
    nameEN: 'Iron Body',
    descriptionTH: 'เพิ่มความทนทานอย่างมหาศาล',
    descriptionEN: 'Massively increases damage resistance',
    icon: '🛡️',
    color: '#4488FF',
  },
  {
    id: 'fast_recovery',
    nameTH: 'ฟื้นตัวเร็ว',
    nameEN: 'Fast Recovery',
    descriptionTH: 'ฟื้นตัวจากการล้มได้เร็วขึ้น',
    descriptionEN: 'Recover from knockdowns much faster',
    icon: '💚',
    color: '#44FF88',
  },
  {
    id: 'lightning_reflexes',
    nameTH: 'ปฏิกิริยาสายฟ้า',
    nameEN: 'Lightning Reflexes',
    descriptionTH: 'เพิ่มโอกาสหลบหลีกอย่างมาก',
    descriptionEN: 'Greatly increases dodge chance',
    icon: '⚡',
    color: '#FFDD44',
  },
  {
    id: 'auto_dodge',
    nameTH: 'หลบหลีกอัตโนมัติ',
    nameEN: 'Auto Dodge',
    descriptionTH: 'หลบอัตโนมัติ 1 ครั้งต่อยก',
    descriptionEN: 'Automatically dodge once per round',
    icon: '💨',
    color: '#88DDFF',
  },
  {
    id: 'read_opponent',
    nameTH: 'อ่านทางคู่ต่อสู้',
    nameEN: 'Read Opponent',
    descriptionTH: 'ยิ่งสู้นานยิ่งแม่นยำ',
    descriptionEN: 'Accuracy increases over time',
    icon: '👁️',
    color: '#AA44FF',
  },
  {
    id: 'counter_king',
    nameTH: 'ราชันสวนกลับ',
    nameEN: 'Counter King',
    descriptionTH: 'เพิ่มพลังการสวนกลับ 50%',
    descriptionEN: '+50% counter-attack damage',
    icon: '🔄',
    color: '#FF44AA',
  },
  {
    id: 'explosive_power',
    nameTH: 'พลังระเบิด',
    nameEN: 'Explosive Power',
    descriptionTH: 'มีโอกาสปล่อยหมัดทำลายล้าง',
    descriptionEN: 'Chance to land a devastating blow',
    icon: '💥',
    color: '#FF8844',
  },
  {
    id: 'berserker',
    nameTH: 'นักสู้บ้าคลั่ง',
    nameEN: 'Berserker',
    descriptionTH: 'ยิ่งเจ็บยิ่งแรง',
    descriptionEN: 'Damage increases as HP decreases',
    icon: '🔥',
    color: '#FF2222',
  },
];

export const STAT_MAX = 7;
export const MAX_TRAINING_SESSIONS = 20;

export const AVAILABLE_SKINS: { id: string; name: string }[] = [
  { id: 'skin_01', name: 'STREET FIGHTER' },
  { id: 'skin_02', name: 'CYBORG NINJA' },
  { id: 'skin_03', name: 'MUAY THAI KING' },
  { id: 'skin_04', name: 'GOLDEN CHAMPION' },
  { id: 'skin_05', name: 'DARK ASSASSIN' },
  { id: 'skin_06', name: 'NEON BRAWLER' },
  { id: 'skin_07', name: 'BRUTAL HEAVYWEIGHT' },
];

export const PUNCH_TYPES = ['jab', 'cross', 'hook', 'uppercut', 'body_shot', 'liver_shot', 'overhand'] as const;
export const KICK_TYPES = ['low_kick', 'body_kick', 'high_kick', 'front_kick', 'side_kick', 'roundhouse', 'spinning_kick'] as const;
