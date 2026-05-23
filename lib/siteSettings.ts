import { supabaseBrowser as supabase } from './supabaseBrowser'

// Ключи настроек — единый источник правды
export const SETTING_KEYS = {
  heroBg: 'hero_bg',
  contact1: 'contact_img_1',
  contact2: 'contact_img_2',
  contact3: 'contact_img_3',
  contact4: 'contact_img_4',
  menuBannerLingerie: 'menu_banner_lingerie',
  menuBannerSwim: 'menu_banner_swim',
  menuBannerClothes: 'menu_banner_clothes',
  menuBannerTights: 'menu_banner_tights',
  menuBannerMen: 'menu_banner_men',
  menuBannerKids: 'menu_banner_kids',
} as const

// Загружает все настройки одним запросом и возвращает объект { key: value }
export async function getSiteSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from('site_settings').select('key, value')
  const map: Record<string, string> = {}
  for (const row of data || []) {
    if (row.value) map[row.key] = row.value
  }
  return map
}

// Маппинг раздела → ключ баннера в меню
export const SECTION_TO_BANNER_KEY: Record<string, string> = {
  lingerie: SETTING_KEYS.menuBannerLingerie,
  swim: SETTING_KEYS.menuBannerSwim,
  clothes: SETTING_KEYS.menuBannerClothes,
  tights: SETTING_KEYS.menuBannerTights,
  men: SETTING_KEYS.menuBannerMen,
  kids: SETTING_KEYS.menuBannerKids,
}
