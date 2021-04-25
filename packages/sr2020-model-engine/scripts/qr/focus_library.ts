import { MagicFocusData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

export type MagicFocus = MagicFocusData & { id: string; name: string };

export const kAllFocuses: MagicFocus[] = [
  { name: 'Экстракт Аспарагуса - фокус сферы лечения', id: 'asparagus', amount: +1, sphere: 'healing', cooldownSeconds: 60 },
  { name: 'Трон молний - фокус сферы боевых заклинаний', id: 'lightning-throne', amount: +1, sphere: 'fighting', cooldownSeconds: 60 },
  { name: 'Чахар-айна - фокус сферы защиты', id: 'chahar-aina', amount: +1, sphere: 'protection', cooldownSeconds: 60 },
  { name: 'Зоччигедрон - фокус сферы анализа астрала', id: 'zocchihedron', amount: +1, sphere: 'astral', cooldownSeconds: 60 },
  { name: 'Кирлиановое перо - фокус сферы анализа ауры', id: 'kirlian-feather', amount: +1, sphere: 'aura', cooldownSeconds: 60 },
  { name: 'Падманулиум - фокус сферы влияния на характеристики', id: 'padmanulium', amount: +1, sphere: 'stats', cooldownSeconds: 60 },
  {
    name: 'Анималистский ретранслятор - фокус сферы лечения',
    id: 'animalistic-retranslator',
    amount: +2,
    sphere: 'healing',
    cooldownSeconds: 300,
  },
  { name: 'Меч Ареса - фокус сферы боевых заклинаний', id: 'ares-sword', amount: +2, sphere: 'fighting', cooldownSeconds: 300 },
  { name: 'Щит Афины - фокус сферы защиты', id: 'athena-shield', amount: +2, sphere: 'protection', cooldownSeconds: 300 },
  { name: 'Хрустальная слеза - фокус сферы анализа астрала', id: 'crystal-teardrop', amount: +2, sphere: 'astral', cooldownSeconds: 300 },
  { name: 'Серебряная игла - фокус сферы анализа ауры', id: 'silver-needle', amount: +2, sphere: 'aura', cooldownSeconds: 300 },
  {
    name: 'Окуляры Миндаля - фокус сферы влияния на характеристики',
    id: 'mindal-oculars',
    amount: +2,
    sphere: 'stats',
    cooldownSeconds: 300,
  },
  { name: 'Первое тепло - фокус сферы лечения', id: 'first-warmth', amount: +3, sphere: 'healing', cooldownSeconds: 1200 },
  { name: 'Палица Муромца - фокус сферы боевых заклинаний', id: 'muromets-club', amount: +3, sphere: 'fighting', cooldownSeconds: 1200 },
  { name: 'Истый храм - фокус сферы защиты', id: 'true-temple', amount: +3, sphere: 'protection', cooldownSeconds: 1200 },
  { name: 'Астровизия - фокус сферы анализа астрала', id: 'astrovision', amount: +3, sphere: 'astral', cooldownSeconds: 1200 },
  { name: 'Сумеречный щуп - фокус сферы анализа ауры', id: 'twilight-probe', amount: +3, sphere: 'aura', cooldownSeconds: 1200 },
  {
    name: 'Тонкий калибратор - фокус сферы влияния на характеристики',
    id: 'precise-calibrator',
    amount: +3,
    sphere: 'stats',
    cooldownSeconds: 1200,
  },
];
