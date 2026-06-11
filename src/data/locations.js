export const LOCATION_DATA = {
  India: {
    code: 'IN',
    states: {
      'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Janakpuri'],
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
      'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
      'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
      'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
      'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
      'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
      'Uttar Pradesh': ['Lucknow', 'Agra', 'Kanpur', 'Varanasi', 'Noida'],
      'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
      'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
      'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
    },
  },
  'United States': {
    code: 'US',
    states: {
      'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Oakland'],
      'New York': ['New York City', 'Brooklyn', 'Queens', 'Buffalo', 'Albany'],
      'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
      'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
      'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Rockford'],
      'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Bellevue'],
      'Massachusetts': ['Boston', 'Cambridge', 'Worcester', 'Springfield'],
      'Georgia': ['Atlanta', 'Savannah', 'Augusta', 'Columbus'],
      'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Boulder'],
      'Nevada': ['Las Vegas', 'Reno', 'Henderson'],
    },
  },
  'United Kingdom': {
    code: 'GB',
    states: {
      'England': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Bristol'],
      'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
      'Wales': ['Cardiff', 'Swansea', 'Newport'],
      'Northern Ireland': ['Belfast', 'Derry'],
    },
  },
  'Australia': {
    code: 'AU',
    states: {
      'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Parramatta'],
      'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
      'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville'],
      'Western Australia': ['Perth', 'Fremantle', 'Bunbury'],
      'South Australia': ['Adelaide', 'Glenelg', 'Mount Gambier'],
    },
  },
  'Canada': {
    code: 'CA',
    states: {
      'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London'],
      'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby'],
      'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
      'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
    },
  },
  'Germany': {
    code: 'DE',
    states: {
      'Bavaria': ['Munich', 'Nuremberg', 'Augsburg'],
      'Berlin': ['Berlin'],
      'Hamburg': ['Hamburg'],
      'North Rhine-Westphalia': ['Cologne', 'Dusseldorf', 'Dortmund', 'Essen'],
      'Baden-Württemberg': ['Stuttgart', 'Mannheim', 'Karlsruhe'],
    },
  },
  'Spain': {
    code: 'ES',
    states: {
      'Catalonia': ['Barcelona', 'Girona', 'Tarragona'],
      'Madrid': ['Madrid'],
      'Andalusia': ['Seville', 'Malaga', 'Granada', 'Cordoba'],
      'Valencia': ['Valencia', 'Alicante', 'Castellon'],
    },
  },
  'Netherlands': {
    code: 'NL',
    states: {
      'North Holland': ['Amsterdam', 'Haarlem', 'Zaandam'],
      'South Holland': ['Rotterdam', 'The Hague', 'Leiden', 'Delft'],
      'Utrecht': ['Utrecht', 'Amersfoort'],
    },
  },
};

export const COUNTRIES = Object.keys(LOCATION_DATA);

export function getStates(country) {
  return country ? Object.keys(LOCATION_DATA[country]?.states || {}) : [];
}

export function getCities(country, state) {
  return (country && state) ? (LOCATION_DATA[country]?.states[state] || []) : [];
}

export function getCountryCode(country) {
  return LOCATION_DATA[country]?.code || '';
}
