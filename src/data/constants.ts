// ============================================================
// LEARN FIGHT — Constants & Abilities Data (v2 — Major Overhaul)
// ============================================================
import { Ability } from '@/types/game';

export const ABILITIES: Ability[] = [
  {
    id: 'crushing_blow',
    nameTH: 'หมัดทำลาย',
    nameEN: 'Crushing Blow',
    descriptionTH: 'Heavy Strike สร้างความเสียหาย +40% และมีโอกาส 15% ทำให้สตัน',
    descriptionEN: 'Heavy Strikes deal +40% damage with 15% stun chance',
    icon: '⚡',
    color: '#CD7F32',
  },
  {
    id: 'afterimage',
    nameTH: 'ภาพหลอน',
    nameEN: 'Afterimage',
    descriptionTH: 'หลบสำเร็จ +30% และสวนกลับสร้างความเสียหายสองเท่า',
    descriptionEN: 'Dodge success +30%, counter damage doubled',
    icon: '💨',
    color: '#00BFFF',
  },
  {
    id: 'iron_wall',
    nameTH: 'กำแพงเหล็ก',
    nameEN: 'Iron Wall',
    descriptionTH: 'ป้องกันบล็อก Light Strike 100% และลด Heavy Strike 85%',
    descriptionEN: 'Defend blocks 100% Light Strikes and reduces Heavy Strikes by 85%',
    icon: '🛡️',
    color: '#708090',
  },
  {
    id: 'wildfire',
    nameTH: 'ไฟลามทุ่ง',
    nameEN: 'Wildfire',
    descriptionTH: 'Light Strike โจมตีสองครั้ง (ครั้งที่ 2 ที่ 50%) Special จุดไฟ DoT 5 หน่วยเป็นเวลา 3 เทิร์น',
    descriptionEN: 'Light Strikes hit twice (2nd at 50%), Special ignites for 5 DoT over 3 turns',
    icon: '🔥',
    color: '#DC143C',
  },
  {
    id: 'phase_shift',
    nameTH: 'เลื่อนมิติ',
    nameEN: 'Phase Shift',
    descriptionTH: 'Special = หลบทุกอย่าง 1 เทิร์น ใช้ได้ครั้งเดียวต่อยก',
    descriptionEN: 'Special grants full evasion for 1 turn, once per round',
    icon: '👻',
    color: '#9B30FF',
  },
  {
    id: 'blood_rage',
    nameTH: 'คลั่งเลือด',
    nameEN: 'Blood Rage',
    descriptionTH: 'เมื่อ HP ต่ำกว่า 30% การโจมตีทั้งหมด +60% ความเสียหาย',
    descriptionEN: 'Below 30% HP, all attacks deal +60% damage',
    icon: '💀',
    color: '#8B0000',
  },
  {
    id: 'mind_read',
    nameTH: 'อ่านใจ',
    nameEN: 'Mind Read',
    descriptionTH: 'หลังจาก 3 เทิร์นจะเห็นการกระทำของ AI, Special เปิดเผยทันที',
    descriptionEN: 'After 3 turns see AI action, Special reveals immediately',
    icon: '👁️',
    color: '#FFD700',
  },
];

export const STAT_MAX = 7;
export const MAX_TRAINING_SESSIONS = 20;

export const AVAILABLE_SKINS: { id: string; name: string }[] = [
  { id: 'skin_01', name: 'KRONOS' },
  { id: 'skin_02', name: 'VORTEX' },
  { id: 'skin_03', name: 'AEGIS' },
  { id: 'skin_04', name: 'BLAZE' },
  { id: 'skin_05', name: 'PHANTOM' },
  { id: 'skin_06', name: 'RAZE' },
  { id: 'skin_07', name: 'SAGE' },
];

export const PUNCH_TYPES = ['jab', 'cross', 'hook', 'uppercut', 'body_shot', 'liver_shot', 'overhand'] as const;
export const KICK_TYPES = ['low_kick', 'body_kick', 'high_kick', 'front_kick', 'side_kick', 'roundhouse', 'spinning_kick'] as const;
