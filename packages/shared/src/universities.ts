// ── Ghana Universities Database ──
// Comprehensive list of accredited universities and tertiary institutions in Ghana.
// Sources: Ghana Tertiary Education Commission (GTEC), Wikipedia, UniRank 2025.

export enum UniversityType {
  PUBLIC = 'public',
  TECHNICAL = 'technical',
  PROFESSIONAL = 'professional',
  CHARTERED_PRIVATE = 'chartered_private',
  PRIVATE = 'private',
  REGIONAL = 'regional',
}

export interface GhanaUniversity {
  name: string;
  abbreviation: string;
  type: UniversityType;
  location: string;
  region: string;
  founded?: number;
}

// ════════════════════════════════════════════════════════
//  PUBLIC TRADITIONAL UNIVERSITIES (16)
// ════════════════════════════════════════════════════════
export const PUBLIC_UNIVERSITIES: GhanaUniversity[] = [
  { name: 'University of Ghana', abbreviation: 'UG', type: UniversityType.PUBLIC, location: 'Legon, Accra', region: 'Greater Accra', founded: 1948 },
  { name: 'Kwame Nkrumah University of Science and Technology', abbreviation: 'KNUST', type: UniversityType.PUBLIC, location: 'Kumasi', region: 'Ashanti', founded: 1952 },
  { name: 'University of Cape Coast', abbreviation: 'UCC', type: UniversityType.PUBLIC, location: 'Cape Coast', region: 'Central', founded: 1961 },
  { name: 'University of Education, Winneba', abbreviation: 'UEW', type: UniversityType.PUBLIC, location: 'Winneba', region: 'Central', founded: 1992 },
  { name: 'University for Development Studies', abbreviation: 'UDS', type: UniversityType.PUBLIC, location: 'Tamale', region: 'Northern', founded: 1992 },
  { name: 'University of Professional Studies, Accra', abbreviation: 'UPSA', type: UniversityType.PUBLIC, location: 'Legon, Accra', region: 'Greater Accra', founded: 1965 },
  { name: 'University of Mines and Technology', abbreviation: 'UMaT', type: UniversityType.PUBLIC, location: 'Tarkwa', region: 'Western', founded: 2001 },
  { name: 'University of Health and Allied Sciences', abbreviation: 'UHAS', type: UniversityType.PUBLIC, location: 'Ho', region: 'Volta', founded: 2011 },
  { name: 'University of Energy and Natural Resources', abbreviation: 'UENR', type: UniversityType.PUBLIC, location: 'Sunyani', region: 'Bono', founded: 2012 },
  { name: 'University of Environment and Sustainable Development', abbreviation: 'UESD', type: UniversityType.PUBLIC, location: 'Somanya', region: 'Eastern', founded: 2020 },
  { name: 'C.K. Tedam University of Technology and Applied Sciences', abbreviation: 'CKT-UTAS', type: UniversityType.PUBLIC, location: 'Navrongo', region: 'Upper East', founded: 2020 },
  { name: 'Simon Diedong Dombo University of Business and Integrated Development Studies', abbreviation: 'SDD-UBIDS', type: UniversityType.PUBLIC, location: 'Wa', region: 'Upper West', founded: 2020 },
  { name: 'Akenten Appiah-Menka University of Skills Training and Entrepreneurial Development', abbreviation: 'AAMUSTED', type: UniversityType.PUBLIC, location: 'Kumasi', region: 'Ashanti', founded: 2020 },
  { name: 'Ghana Institute of Management and Public Administration', abbreviation: 'GIMPA', type: UniversityType.PUBLIC, location: 'Legon, Accra', region: 'Greater Accra' },
  { name: 'Ghana Communication Technology University', abbreviation: 'GCTU', type: UniversityType.PUBLIC, location: 'Tesano, Accra', region: 'Greater Accra', founded: 2005 },
  { name: 'University of Media, Arts and Communication', abbreviation: 'UniMAC', type: UniversityType.PUBLIC, location: 'Accra', region: 'Greater Accra' },
];

// ════════════════════════════════════════════════════════
//  PUBLIC TECHNICAL UNIVERSITIES (10)
// ════════════════════════════════════════════════════════
export const TECHNICAL_UNIVERSITIES: GhanaUniversity[] = [
  { name: 'Accra Technical University', abbreviation: 'ATU', type: UniversityType.TECHNICAL, location: 'Accra', region: 'Greater Accra' },
  { name: 'Kumasi Technical University', abbreviation: 'KsTU', type: UniversityType.TECHNICAL, location: 'Kumasi', region: 'Ashanti' },
  { name: 'Cape Coast Technical University', abbreviation: 'CCTU', type: UniversityType.TECHNICAL, location: 'Cape Coast', region: 'Central' },
  { name: 'Koforidua Technical University', abbreviation: 'KTU', type: UniversityType.TECHNICAL, location: 'Koforidua', region: 'Eastern' },
  { name: 'Tamale Technical University', abbreviation: 'TaTU', type: UniversityType.TECHNICAL, location: 'Tamale', region: 'Northern' },
  { name: 'Ho Technical University', abbreviation: 'HTU', type: UniversityType.TECHNICAL, location: 'Ho', region: 'Volta' },
  { name: 'Takoradi Technical University', abbreviation: 'TTU', type: UniversityType.TECHNICAL, location: 'Takoradi', region: 'Western' },
  { name: 'Sunyani Technical University', abbreviation: 'STU', type: UniversityType.TECHNICAL, location: 'Sunyani', region: 'Bono' },
  { name: 'Bolgatanga Technical University', abbreviation: 'BTU', type: UniversityType.TECHNICAL, location: 'Bolgatanga', region: 'Upper East' },
  { name: 'Dr. Hilla Limann Technical University', abbreviation: 'DHLTU', type: UniversityType.TECHNICAL, location: 'Wa', region: 'Upper West' },
];

// ════════════════════════════════════════════════════════
//  PUBLIC PROFESSIONAL INSTITUTIONS (5+)
// ════════════════════════════════════════════════════════
export const PROFESSIONAL_INSTITUTIONS: GhanaUniversity[] = [
  { name: 'Ghana Institute of Journalism', abbreviation: 'GIJ', type: UniversityType.PROFESSIONAL, location: 'Accra', region: 'Greater Accra' },
  { name: 'Ghana Institute of Languages', abbreviation: 'GIL', type: UniversityType.PROFESSIONAL, location: 'Accra', region: 'Greater Accra', founded: 1961 },
  { name: 'Ghana Institute of Surveying and Mapping', abbreviation: 'GISM', type: UniversityType.PROFESSIONAL, location: 'Accra', region: 'Greater Accra' },
  { name: 'Ghana Armed Forces Command and Staff College', abbreviation: 'GAFCSC', type: UniversityType.PROFESSIONAL, location: 'Accra', region: 'Greater Accra' },
  { name: 'Kofi Annan International Peacekeeping Training Centre', abbreviation: 'KAIPTC', type: UniversityType.PROFESSIONAL, location: 'Accra', region: 'Greater Accra', founded: 1998 },
  { name: 'National Film and Television Institute', abbreviation: 'NAFTI', type: UniversityType.PROFESSIONAL, location: 'Accra', region: 'Greater Accra', founded: 1978 },
  { name: 'Institution of Local Government Studies', abbreviation: 'ILGS', type: UniversityType.PROFESSIONAL, location: 'Legon, Accra', region: 'Greater Accra' },
];

// ════════════════════════════════════════════════════════
//  REGIONAL UNIVERSITY
// ════════════════════════════════════════════════════════
export const REGIONAL_UNIVERSITIES: GhanaUniversity[] = [
  { name: 'Regional Maritime University', abbreviation: 'RMU', type: UniversityType.REGIONAL, location: 'Accra', region: 'Greater Accra', founded: 2007 },
];

// ════════════════════════════════════════════════════════
//  CHARTERED PRIVATE UNIVERSITIES (24)
// ════════════════════════════════════════════════════════
export const CHARTERED_PRIVATE_UNIVERSITIES: GhanaUniversity[] = [
  { name: 'Ashesi University', abbreviation: 'Ashesi', type: UniversityType.CHARTERED_PRIVATE, location: 'Berekuso', region: 'Eastern', founded: 2002 },
  { name: 'Valley View University', abbreviation: 'VVU', type: UniversityType.CHARTERED_PRIVATE, location: 'Oyibi, Accra', region: 'Greater Accra', founded: 1979 },
  { name: 'Central University', abbreviation: 'CU', type: UniversityType.CHARTERED_PRIVATE, location: 'Tema', region: 'Greater Accra', founded: 1998 },
  { name: 'Pentecost University', abbreviation: 'PU', type: UniversityType.CHARTERED_PRIVATE, location: 'Sowutuom, Accra', region: 'Greater Accra', founded: 2003 },
  { name: 'All Nations University', abbreviation: 'ANU', type: UniversityType.CHARTERED_PRIVATE, location: 'Koforidua', region: 'Eastern', founded: 2002 },
  { name: 'KAAF University College', abbreviation: 'KAAF', type: UniversityType.CHARTERED_PRIVATE, location: 'Kasoa', region: 'Central', founded: 2006 },
  { name: 'Ensign Global University', abbreviation: 'EGU', type: UniversityType.CHARTERED_PRIVATE, location: 'Kpong', region: 'Eastern', founded: 2014 },
  { name: 'Akrofi-Christaller Institute of Theology, Mission and Culture', abbreviation: 'ACI', type: UniversityType.CHARTERED_PRIVATE, location: 'Akropong-Akuapem', region: 'Eastern', founded: 1987 },
  { name: 'Open University of West Africa', abbreviation: 'OUWA', type: UniversityType.CHARTERED_PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 2011 },
  { name: 'Academic City University', abbreviation: 'ACU', type: UniversityType.CHARTERED_PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Lancaster University Ghana', abbreviation: 'LUG', type: UniversityType.CHARTERED_PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 2013 },
  { name: 'Webster University Ghana', abbreviation: 'WUG', type: UniversityType.CHARTERED_PRIVATE, location: 'East Legon, Accra', region: 'Greater Accra', founded: 2012 },
  { name: 'Dominion University College', abbreviation: 'DUC', type: UniversityType.CHARTERED_PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Catholic University of Ghana', abbreviation: 'CUG', type: UniversityType.CHARTERED_PRIVATE, location: 'Fiapre, Sunyani', region: 'Bono', founded: 2003 },
  { name: 'Presbyterian University, Ghana', abbreviation: 'PUG', type: UniversityType.CHARTERED_PRIVATE, location: 'Abetifi-Kwahu', region: 'Eastern', founded: 2003 },
  { name: 'Methodist University Ghana', abbreviation: 'MUG', type: UniversityType.CHARTERED_PRIVATE, location: 'Dansoman, Accra', region: 'Greater Accra', founded: 2000 },
  { name: 'Christian Service University College', abbreviation: 'CSUC', type: UniversityType.CHARTERED_PRIVATE, location: 'Kumasi', region: 'Ashanti', founded: 1974 },
  { name: 'Wisconsin International University College', abbreviation: 'WIUC', type: UniversityType.CHARTERED_PRIVATE, location: 'Agbogba, Accra', region: 'Greater Accra', founded: 2000 },
  { name: 'Ghana Christian University College', abbreviation: 'GCUC', type: UniversityType.CHARTERED_PRIVATE, location: 'Dodowa, Accra', region: 'Greater Accra' },
  { name: 'Ghana Baptist University College', abbreviation: 'GBUC', type: UniversityType.CHARTERED_PRIVATE, location: 'Abuakwa, Kumasi', region: 'Ashanti', founded: 2006 },
  { name: 'Islamic University College, Ghana', abbreviation: 'IUCG', type: UniversityType.CHARTERED_PRIVATE, location: 'East Legon, Accra', region: 'Greater Accra', founded: 1988 },
  { name: 'Kessben University College', abbreviation: 'KUC-K', type: UniversityType.CHARTERED_PRIVATE, location: 'Kuntenase', region: 'Ashanti' },
  { name: 'Perez University College', abbreviation: 'PERUC', type: UniversityType.CHARTERED_PRIVATE, location: 'Winneba', region: 'Central' },
  { name: 'West End University College', abbreviation: 'WEUC', type: UniversityType.CHARTERED_PRIVATE, location: 'Accra', region: 'Greater Accra' },
];

// ════════════════════════════════════════════════════════
//  PRIVATE UNIVERSITIES & UNIVERSITY COLLEGES
// ════════════════════════════════════════════════════════
export const PRIVATE_UNIVERSITIES: GhanaUniversity[] = [
  { name: 'Accra Institute of Technology', abbreviation: 'AIT', type: UniversityType.PRIVATE, location: 'Cantonments, Accra', region: 'Greater Accra', founded: 2005 },
  { name: 'African University College of Communications', abbreviation: 'AUCC', type: UniversityType.PRIVATE, location: 'Adabraka, Accra', region: 'Greater Accra' },
  { name: 'Anglican University College of Technology', abbreviation: 'ANGUTECH', type: UniversityType.PRIVATE, location: 'Nkoranza', region: 'Bono East', founded: 2008 },
  { name: 'BlueCrest University College', abbreviation: 'BCUC', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 1999 },
  { name: 'Catholic Institute of Business and Technology', abbreviation: 'CIBT', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Christ Apostolic University College', abbreviation: 'CAUC', type: UniversityType.PRIVATE, location: 'Kumasi', region: 'Ashanti', founded: 2011 },
  { name: 'Data Link University College', abbreviation: 'DLUC', type: UniversityType.PRIVATE, location: 'Tema', region: 'Greater Accra', founded: 2006 },
  { name: 'Evangelical Presbyterian University College', abbreviation: 'EPUC', type: UniversityType.PRIVATE, location: 'Ho', region: 'Volta', founded: 2008 },
  { name: 'Family Health Medical School', abbreviation: 'FHMS', type: UniversityType.PRIVATE, location: 'Teshie, Accra', region: 'Greater Accra', founded: 2015 },
  { name: 'Garden City University College', abbreviation: 'GCUC-K', type: UniversityType.PRIVATE, location: 'Kumasi', region: 'Ashanti', founded: 2001 },
  { name: 'Jayee University College', abbreviation: 'JUC', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Kings University College', abbreviation: 'KUC', type: UniversityType.PRIVATE, location: 'Aplaku Hills, Accra', region: 'Greater Accra' },
  { name: 'Knutsford University College', abbreviation: 'KnUC', type: UniversityType.PRIVATE, location: 'East Legon, Accra', region: 'Greater Accra' },
  { name: 'Maranatha University College', abbreviation: 'MUC', type: UniversityType.PRIVATE, location: 'Sowutuom, Accra', region: 'Greater Accra' },
  { name: 'Marshalls University College', abbreviation: 'MSUC', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Meridian University College', abbreviation: 'MEDUCOL', type: UniversityType.PRIVATE, location: 'Weija, Accra', region: 'Greater Accra' },
  { name: 'Mountcrest University College', abbreviation: 'MCUC', type: UniversityType.PRIVATE, location: 'Kanda, Accra', region: 'Greater Accra' },
  { name: 'Palm University College', abbreviation: 'PaUC', type: UniversityType.PRIVATE, location: 'Manya, Shai Hills', region: 'Greater Accra' },
  { name: 'Radford University College', abbreviation: 'RUC', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Regent University College of Science and Technology', abbreviation: 'RUCST', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 2003 },
  { name: 'Spiritan University College', abbreviation: 'Spiritan', type: UniversityType.PRIVATE, location: 'Ejisu', region: 'Ashanti' },
  { name: 'University College of Agriculture and Environmental Studies', abbreviation: 'UCAES', type: UniversityType.PRIVATE, location: 'Bunso', region: 'Eastern', founded: 1963 },
  { name: 'University College of Management Studies', abbreviation: 'UCOMS', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 1974 },
  { name: 'Zenith University College', abbreviation: 'ZUC', type: UniversityType.PRIVATE, location: 'La, Accra', region: 'Greater Accra', founded: 2001 },
  { name: 'Good News Theological Seminary', abbreviation: 'GNTS', type: UniversityType.PRIVATE, location: 'Oyibi, Accra', region: 'Greater Accra', founded: 1971 },
  { name: 'Pan African Christian University College', abbreviation: 'PACUC', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Advanced Business University College', abbreviation: 'ABUC', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'China Europe International Business School', abbreviation: 'CEIBS', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 1994 },
  { name: 'Entrepreneurship Training Institute', abbreviation: 'ETI', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'Osei Tutu II Institute for Advanced ICT Studies', abbreviation: 'OTIAICTS', type: UniversityType.PRIVATE, location: 'Kumasi', region: 'Ashanti' },
  { name: 'North American Center for Professional Studies', abbreviation: 'NACPS', type: UniversityType.PRIVATE, location: 'Kasoa', region: 'Central', founded: 2011 },
  { name: 'The Bible University College of Ghana', abbreviation: 'BUCG', type: UniversityType.PRIVATE, location: 'Akuapem', region: 'Eastern' },
  { name: 'College of Science, Arts and Education', abbreviation: 'CSAE', type: UniversityType.PRIVATE, location: 'Sunyani', region: 'Bono', founded: 2016 },
  { name: 'Technical University College', abbreviation: 'TUC', type: UniversityType.PRIVATE, location: 'Tamale', region: 'Northern' },
  { name: 'Deltas University College', abbreviation: 'DeltaUC', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra' },
  { name: 'University College of Design and Technology', abbreviation: 'AUCDT', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 2015 },
  { name: 'Consular and Diplomatic Service University', abbreviation: 'CDSU', type: UniversityType.PRIVATE, location: 'Accra', region: 'Greater Accra', founded: 2015 },
];

// ════════════════════════════════════════════════════════
//  COMBINED LIST — All universities
// ════════════════════════════════════════════════════════
export const GHANA_UNIVERSITIES: GhanaUniversity[] = [
  ...PUBLIC_UNIVERSITIES,
  ...TECHNICAL_UNIVERSITIES,
  ...PROFESSIONAL_INSTITUTIONS,
  ...REGIONAL_UNIVERSITIES,
  ...CHARTERED_PRIVATE_UNIVERSITIES,
  ...PRIVATE_UNIVERSITIES,
];

// ════════════════════════════════════════════════════════
//  HELPER MAPS
// ════════════════════════════════════════════════════════

/** Quick lookup: abbreviation → full university name */
export const UNIVERSITY_BY_ABBREVIATION = Object.fromEntries(
  GHANA_UNIVERSITIES.map((u) => [u.abbreviation, u.name]),
) as Record<string, string>;

/** Quick lookup: full name → abbreviation */
export const ABBREVIATION_BY_UNIVERSITY = Object.fromEntries(
  GHANA_UNIVERSITIES.map((u) => [u.name, u.abbreviation]),
) as Record<string, string>;

/** All university names (sorted alphabetically) */
export const UNIVERSITY_NAMES = GHANA_UNIVERSITIES.map((u) => u.name).sort();

/** All abbreviations (sorted) */
export const UNIVERSITY_ABBREVIATIONS = GHANA_UNIVERSITIES.map((u) => u.abbreviation).sort();

/** Universities grouped by region */
export const UNIVERSITIES_BY_REGION = GHANA_UNIVERSITIES.reduce<Record<string, GhanaUniversity[]>>(
  (acc, uni) => {
    if (!acc[uni.region]) acc[uni.region] = [];
    acc[uni.region].push(uni);
    return acc;
  },
  {},
);

/** Universities grouped by type */
export const UNIVERSITIES_BY_TYPE = GHANA_UNIVERSITIES.reduce<Record<UniversityType, GhanaUniversity[]>>(
  (acc, uni) => {
    if (!acc[uni.type]) acc[uni.type] = [];
    acc[uni.type].push(uni);
    return acc;
  },
  {} as Record<UniversityType, GhanaUniversity[]>,
);

/** Total count */
export const TOTAL_UNIVERSITIES = GHANA_UNIVERSITIES.length;

/** Ghana regions (all 16) */
export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Western North',
  'Oti',
  'North East',
  'Savannah',
] as const;
