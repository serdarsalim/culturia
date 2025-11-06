import worldCountries from 'world-countries';
import type { Country } from '@/types';

// Create country data from world-countries package
const baseCountries: Country[] = worldCountries.map((country) => ({
  code: country.cca3, // ISO 3166-1 alpha-3
  name: country.name.common,
  flag: country.flag,
  languages: Object.values(country.languages || {}),
}));

// Ensure Palestine is included
const palestineExists = baseCountries.some((c) => c.code === 'PSE');

if (!palestineExists) {
  baseCountries.push({
    code: 'PSE',
    name: 'Palestine',
    flag: '🇵🇸',
    languages: ['Arabic', 'Hebrew'],
  });
}

// Sort alphabetically by name
export const countries = baseCountries.sort((a, b) => a.name.localeCompare(b.name));

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getCountryName(code: string): string {
  return getCountryByCode(code)?.name || code;
}

export function getCountryFlag(code: string): string {
  return getCountryByCode(code)?.flag || '🏳️';
}

// Map of country codes to names for quick lookup
export const countryCodeToName = countries.reduce((acc, country) => {
  acc[country.code] = country.name;
  return acc;
}, {} as Record<string, string>);

// Map of country names to codes for reverse lookup
export const countryNameToCode = countries.reduce((acc, country) => {
  acc[country.name.toLowerCase()] = country.code;
  return acc;
}, {} as Record<string, string>);

export default countries;
