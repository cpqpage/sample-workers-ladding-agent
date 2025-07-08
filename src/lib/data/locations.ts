import { get } from 'svelte/store';
import { _ } from 'svelte-i18n';

export interface Country {
  code: string;
  name: string;
  states: State[];
}

export interface State {
  code: string;
  name: string;
  cities: City[];
}

export interface City {
  code: string;
  name: string;
}

// 基础数据
const baseCountries = [
  {
    code: 'CN',
    states: [
      {
        code: 'BJ',
        cities: ['BJ']
      },
      {
        code: 'SH',
        cities: ['SH']
      }
    ]
  },
  {
    code: 'US',
    states: [
      {
        code: 'CA',
        cities: ['SF', 'LA']
      },
      {
        code: 'NY',
        cities: ['NYC', 'BUF']
      }
    ]
  }
];

export function getCountries(): Country[] {
  return baseCountries.map(country => ({
    code: country.code,
    name: get(_)('locations.countries.' + country.code),
    states: country.states.map(state => ({
      code: state.code,
      name: get(_)('locations.states.' + country.code + '.' + state.code),
      cities: state.cities.map(city => ({
        code: city,
        name: get(_)('locations.cities.' + country.code + '.' + state.code + '.' + city)
      }))
    }))
  }));
}

export function getStates(countryCode: string): State[] {
  const country = baseCountries.find(c => c.code === countryCode);
  if (!country) return [];
  
  return country.states.map(state => ({
    code: state.code,
    name: get(_)('locations.states.' + countryCode + '.' + state.code),
    cities: state.cities.map(city => ({
      code: city,
      name: get(_)('locations.cities.' + countryCode + '.' + state.code + '.' + city)
    }))
  }));
}

export function getCities(countryCode: string, stateCode: string): City[] {
  const country = baseCountries.find(c => c.code === countryCode);
  if (!country) return [];
  
  const state = country.states.find(s => s.code === stateCode);
  if (!state) return [];
  
  return state.cities.map(city => ({
    code: city,
    name: get(_)('locations.cities.' + countryCode + '.' + stateCode + '.' + city)
  }));
} 