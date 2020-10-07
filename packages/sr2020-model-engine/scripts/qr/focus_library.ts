import { MagicFocusData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';

export type MagicFocus = MagicFocusData & { id: string; name: string };

export const kAllFocuses: MagicFocus[] = [
  { name: 'Экстракт Аспарагуса - фокус сферы лечения', id: 'asparagus', amount: +1, sphere: 'healing' },
  { name: 'Трон молний - фокус сферы боевых заклинаний', id: 'lightning-throne', amount: +1, sphere: 'fighting' },
  { name: 'Чахар-айна - фокус сферы защиты', id: 'chahar-aina', amount: +1, sphere: 'protection' },
  { name: 'Зоччигедрон - фокус сферы анализа астрала', id: 'zocchihedron', amount: +1, sphere: 'astral' },
  { name: 'Кирлиановое перо - фокус сферы анализа ауры', id: 'kirlian-feather', amount: +1, sphere: 'aura' },
  { name: 'Падманулиум - фокус сферы влияния на характеристики', id: 'padmanulium', amount: +1, sphere: 'stats' },
  { name: 'Анималистский ретранслятор - фокус сферы лечения', id: 'animalistic-retranslator', amount: +2, sphere: 'healing' },
  { name: 'Меч Ареса - фокус сферы боевых заклинаний', id: 'ares-sword', amount: +2, sphere: 'fighting' },
  { name: 'Щит Афины - фокус сферы защиты', id: 'athena-shield', amount: +2, sphere: 'protection' },
  { name: 'Хрустальная слеза - фокус сферы анализа астрала', id: 'crystal-teardrop', amount: +2, sphere: 'astral' },
  { name: 'Серебряная игла - фокус сферы анализа ауры', id: 'silver-needle', amount: +2, sphere: 'aura' },
  { name: 'Окуляры Миндаля - фокус сферы влияния на характеристики', id: 'mindal-oculars', amount: +2, sphere: 'stats' },
  { name: 'Первое тепло - фокус сферы лечения', id: 'first-warmth', amount: +3, sphere: 'healing' },
  { name: 'Палица Муромца - фокус сферы боевых заклинаний', id: 'muromets-club', amount: +3, sphere: 'fighting' },
  { name: 'Истый храм - фокус сферы защиты', id: 'true-temple', amount: +3, sphere: 'protection' },
  { name: 'Астровизия - фокус сферы анализа астрала', id: 'astrovision', amount: +3, sphere: 'astral' },
  { name: 'Сумеречный щуп - фокус сферы анализа ауры', id: 'twilight-probe', amount: +3, sphere: 'aura' },
  { name: 'Тонкий калибратор - фокус сферы влияния на характеристики', id: 'precise-calibrator', amount: +3, sphere: 'stats' },
];
