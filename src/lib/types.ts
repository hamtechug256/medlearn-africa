// Types for the nursing education platform - can be used on both client and server

export interface Topic {
  id: string;
  title: string;
  filename: string;
  category: string;
  description: string;
  wordCount: number;
  images: string[];
  content?: string;
  rawHtml?: string;
  semester?: string;
  courseUnit?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  description: string;
}

export interface Summary {
  totalTopics: number;
  totalImages: number;
  downloadedImages: number;
  categories: Record<string, number>;
  processedAt: string;
}

export interface ImagesMap {
  [originalUrl: string]: string;
}

export interface CourseUnit {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  keywords: string[];
  semesterId: string;
}

export interface Semester {
  id: string;
  name: string;
  year: number;
  semester: number;
  topics: string[];
  description: string;
  color: string;
  gradient: string;
  icon: string;
  courseUnits: CourseUnit[];
}

// Course units data with keywords for topic mapping
export const courseUnitsData: CourseUnit[] = [
  // Year 1 Semester 1
  {
    id: 'dnd-111',
    code: 'DND 111',
    name: 'Anatomy & Physiology',
    description: 'Study of human body structure and function including all organ systems',
    icon: 'Heart',
    color: '#ef4444',
    semesterId: 'year-1-semester-1',
    keywords: ['anatomy and physiology', 'anatomy of the', 'physiology of the', 'skeletal system', 'muscular system', 'blood and its composition', 'cardiovascular system notes', 'lymphatic system notes', 'digestive system notes', 'terms used in anatomy', 'atoms molecules and compounds', 'disease of lymph vessels', 'benign prostatic hyperplasia', 'fluid and electrolyte imbalance']
  },
  {
    id: 'dnd-112',
    code: 'DND 112',
    name: 'Foundations of Nursing',
    description: 'Introduction to nursing history, ethics, and professional practice',
    icon: 'BookOpen',
    color: '#3b82f6',
    semesterId: 'year-1-semester-1',
    keywords: ['history of nursing', 'ethical', 'ethics', 'medico-legal', 'nursing procedure', 'general principles', 'standards of care', 'legal aspects and national policies', 'legal aspects']
  },
  {
    id: 'dnd-113',
    code: 'DND 113',
    name: 'Sociology & Psychology',
    description: 'Understanding human behavior, social aspects, and mental processes in healthcare',
    icon: 'Brain',
    color: '#8b5cf6',
    semesterId: 'year-1-semester-1',
    keywords: ['sociology', 'psychology', 'socialization', 'social aspects', 'nurse-patient relationship', 'personality', 'mental defense', 'stress', 'emotions', 'human groups']
  },
  {
    id: 'dnd-114',
    code: 'DND 114',
    name: 'Information Technology & Microbiology',
    description: 'Computer skills, internet use, and study of microorganisms',
    icon: 'Laptop',
    color: '#10b981',
    semesterId: 'year-1-semester-1',
    keywords: ['computer', 'computing', 'microsoft', 'internet', 'microbiology', 'normal flora', 'pathological effects', 'microorganisms', 'maintenance']
  },
  {
    id: 'dnd-115',
    code: 'DND 115',
    name: 'Environmental Health',
    description: 'Personal hygiene, community health, and environmental safety',
    icon: 'Leaf',
    color: '#06b6d4',
    semesterId: 'year-1-semester-1',
    keywords: ['personal', 'communal health', 'dimensions', 'determinants', 'health and disease', 'disease prevention', 'environmental hygiene', 'housing', 'ventilation', 'lighting', 'water supply', 'food hygiene', 'sanitation']
  },
  // Year 1 Semester 2
  {
    id: 'dnd-121',
    code: 'DND 121',
    name: 'Advanced Anatomy & Physiology',
    description: 'Continuation of body systems including respiratory, renal, endocrine, nervous, and reproductive systems',
    icon: 'Activity',
    color: '#f43f5e',
    semesterId: 'year-1-semester-2',
    keywords: ['respiratory system', 'renal system', 'endocrine system', 'nervous system', 'applied anatomy', 'special senses', 'male reproductive', 'female reproductive', 'organs of special']
  },
  {
    id: 'dnd-122',
    code: 'DND 122',
    name: 'Nursing Process & Procedures',
    description: 'Nursing process, wound care, drug administration, and clinical procedures',
    icon: 'ClipboardList',
    color: '#3b82f6',
    semesterId: 'year-1-semester-2',
    keywords: ['nursing process', 'wound dressing', 'administer drugs', 'blood transfusion', 'last office', 'catheterization', 'vulva toilet', 'infection prevention']
  },
  {
    id: 'dnd-123',
    code: 'DND 123',
    name: 'Medicine I',
    description: 'Introduction to medicine and cardiovascular disorders',
    icon: 'Stethoscope',
    color: '#ef4444',
    semesterId: 'year-1-semester-2',
    keywords: ['medicine introduction and general causes', 'cardiovascular disorders', 'signs and symptoms of cardiovascular', 'inflammatory disorders of the heart', 'pericarditis', 'myocarditis', 'infective endocarditis', 'congestive cardiac failure', 'rheumatic heart disease', 'thrombus and embolus', 'hypertension', 'arteriosclerosis and atherosclerosis', 'brucellosis', 'urinary tract infections', 'tuberculosis', 'malaria', 'cholera', 'typhoid fever', 'yellow fever', 'rabies', 'anthrax', 'leprosy', 'schistosomiasis', 'trypanosomiasis', 'dracunculosis', 'elephantiasis', 'onchocerciasis', 'helminthic diseases', 'sexually transmitted diseases', 'gonorrhoea', 'syphilis', 'genital ulcer syndrome', 'inguinal buboes', 'syndromic management of sti', 'pelvic inflammatory diseases', 'ovarian cysts', 'uterine fibroids', 'cervical ectropion', 'menstrual disorders', 'dysmenorrhoea', 'menorrhagia', 'metrorrhagia', 'polymenorrhoea', 'premenstrual syndrome', 'amenorrhoea', 'precocious puberty', 'dysentery', 'ebola haemorrhagic fevers', 'ebola', 'congenital toxoplasmosis', 'toxoplasmosis', 'dwarfism', 'panhypopituitarism', 'cushing s syndrome', 'cushing', 'liver cirrhosis', 'cirrhosis', 'systemic lupus erythematosus', 'sle', 'systemic lupus', 'organophosphates poisoning', 'organophosphates', 'obstetric vaginal fistula', 'vaginal fistula', 'pelvic organ prolapse', 'pop', 'introduction to communicable diseases', 'communicable diseases', 'gastritis lecture', 'gastroenteritis ge', 'gastroenteritis', 'polycystic kidney disease']
  },
  {
    id: 'dnd-124',
    code: 'DND 124',
    name: 'Medical-Surgical Nursing I',
    description: 'Respiratory system disorders and nursing care',
    icon: 'Wind',
    color: '#06b6d4',
    semesterId: 'year-1-semester-2',
    keywords: ['common cold', 'coryza', 'sinusitis', 'tonsillitis', 'haemophilus', 'pharyngitis', 'laryngitis', 'pneumonia', 'bronchitis', 'emphysema', 'broncho-pulmonary', 'respiratory distress', 'pulmonary hemorrhage', 'asthma', 'sars']
  },
  // Year 2 Semester 1
  {
    id: 'dnd-211',
    code: 'DND 211',
    name: 'Medical-Surgical Nursing II',
    description: 'Urinary system disorders and nursing management',
    icon: 'Droplets',
    color: '#3b82f6',
    semesterId: 'year-2-semester-1',
    keywords: ['urethral discharge', 'cystitis', 'pyelonephritis', 'glomerulonephritis', 'acute glomerulonephritis', 'nephrotic syndrome', 'nephritic syndrome', 'renal failure', 'kidney stones', 'calculi']
  },
  {
    id: 'dnd-212',
    code: 'DND 212',
    name: 'Neurological Nursing',
    description: 'Nervous system disorders and nursing care',
    icon: 'Brain',
    color: '#8b5cf6',
    semesterId: 'year-2-semester-1',
    keywords: ['nervous system disorders', 'meningitis', 'encephalitis lecture', 'cerebrovascular accident', 'stroke', 'unconsciousness coma', 'unconsciousness', 'coma', 'poliomyelitis lecture', 'epilepsy', 'status epilepticus', 'seizure disorders', 'parkinsons disease', 'parkinson s disease', 'parkinson', 'parkinsons', 'trigeminal neuralgia', 'bells palsy', 'facial nerve palsy', 'transverse myelitis', 'spinal cord compression', 'hypoxic ischemic', 'intracranial hemorrhage', 'introduction to unconsciousness']
  },
  {
    id: 'dnd-213',
    code: 'DND 213',
    name: 'Endocrine Nursing',
    description: 'Endocrine system disorders including diabetes and thyroid conditions',
    icon: 'Zap',
    color: '#f59e0b',
    semesterId: 'year-2-semester-1',
    keywords: ['acromegaly', 'gigantism', 'dwarfism panhypopituitarism', 'thyrotoxicosis', 'addisons disease', 'adrenal insufficiency', 'cushings syndrome', 'cushing s syndrome', 'cushing', 'cushings', 'diabetes mellitus', 'pheochromocytoma', 'hypercalcemia', 'hyperaldosteronism']
  },
  // Year 2 Semester 2
  {
    id: 'dnd-221',
    code: 'DND 221',
    name: 'Ophthalmology Nursing',
    description: 'Eye care, disorders, and nursing interventions',
    icon: 'Eye',
    color: '#3b82f6',
    semesterId: 'year-2-semester-2',
    keywords: ['ophthalmology', 'eye anatomy', 'eye trauma', 'foreign body eye', 'conjunctivitis', 'corneal ulcers', 'cataract', 'congenital cataracts', 'glaucoma', 'stye', 'hordeolum', 'strabismus', 'proptosis', 'exophthalmos', 'trachoma', 'visual impairment', 'eye infections', 'eye injuries', 'care of the patient', 'patients eyes', 'patient s eyes', 'foreign body in the eye']
  },
  {
    id: 'dnd-222',
    code: 'DND 222',
    name: 'ENT Nursing',
    description: 'Ear, nose, and throat conditions and care',
    icon: 'Headphones',
    color: '#06b6d4',
    semesterId: 'year-2-semester-2',
    keywords: ['otitis media', 'peritonsillar', 'ear nose throat', 'hearing impairment', 'common tumors of ear', 'removal of foreign bodies', 'care of the patients ears', 'tumors of ear nose']
  },
  {
    id: 'dnd-223',
    code: 'DND 223',
    name: 'Surgical Nursing',
    description: 'Peri-operative care, wound management, and orthopedics',
    icon: 'Scissors',
    color: '#ef4444',
    semesterId: 'year-2-semester-2',
    keywords: ['surgical nursing', 'aseptic technique', 'peri-operative care', 'post-operative nursing', 'surgical shock', 'haemorrhage nursing', 'haemorrhage', 'hemorrhage', 'suturing of the wound', 'fractures', 'orthopedic nursing care', 'traction in nursing', 'burns lecture notes', 'gangrene', 'dressings', 'resuscitation', 'first aid', 'stings and bites', 'under water seal drainage', 'peptic ulcer disease', 'tendonitis', 'bursitis', 'arthritis', 'osteoarthritis', 'ankylosing spondylitis', 'paget disease', 'paget', 'pagets', 'osteoporosis', 'hodgkin disease', 'hodgkin s disease', 'hodgkin', 'hodgkins', 'hodgkins disease', 'tumors neoplasms', 'tumors (neoplasms)', 'natural body defence', 'immunity']
  },
  {
    id: 'dnd-224',
    code: 'DND 224',
    name: 'Advanced Nursing Procedures',
    description: 'Complex clinical procedures and interventions',
    icon: 'Syringe',
    color: '#8b5cf6',
    semesterId: 'year-2-semester-2',
    keywords: ['instilling medication', 'shortening drains', 'perform shortening', 'colostomy care', 'paracentesis', 'lumbar puncture', 'gastronomy feeding', 'gastric lavage', 'tracheostomy care', 'perform colostomy', 'prepare for neural assessment', 'neural assessment', 'carry out gastric', 'prepare for abdominis', 'perform tracheostomy']
  },
  // Year 3 Semester 1
  {
    id: 'dnd-311',
    code: 'DND 311',
    name: 'Community Health Nursing',
    description: 'Public health, community diagnosis, and health promotion',
    icon: 'Users',
    color: '#10b981',
    semesterId: 'year-3-semester-1',
    keywords: ['primary health care', 'phc', 'community based health care', 'cbhc', 'community entry', 'community survey', 'community assessment', 'community diagnosis', 'community mobilization', 'community organization', 'community participation', 'community empowerment', 'community dialogue', 'techniques used to establish community', 'home visiting in community', 'sustainable development goals', 'sdgs', 'integrated disease surveillance', 'concepts of primary health care', 'concept of the community', 'support supervision', 'community based rehabilitative', 'waste management', 'stages of disaster', 'disaster preparedness', 'stakeholders in disaster', 'occupational health hazards', 'occupational health service program', 'occupational health and safety', 'school health program', 'school health', 'artificial disaster prevention', 'prevention and control of disasters', 'hazard prevention and control', 'injection safety and management', 'injection safety']
  },
  {
    id: 'dnd-312',
    code: 'DND 312',
    name: 'Research Methodology',
    description: 'Research methods, data collection, and academic writing',
    icon: 'FileSearch',
    color: '#6366f1',
    semesterId: 'year-3-semester-1',
    keywords: ['research', 'steps in research', 'research designs', 'study design', 'research methods', 'instruments data collection', 'study population', 'sampling', 'sample size', 'formulation research topics', 'literature review', 'methodology', 'research proposal', 'report writing', 'terms used in research', 'ethics in research']
  },
  {
    id: 'dnd-313',
    code: 'DND 313',
    name: 'Management & Leadership',
    description: 'Healthcare management, leadership skills, and human resources',
    icon: 'Briefcase',
    color: '#f59e0b',
    semesterId: 'year-3-semester-1',
    keywords: ['health service management', 'levels of hospital management', 'human resource management', 'human resource planning', 'job analysis', 'recruitment and selection', 'performance appraisal', 'staff delegation', 'directing in management', 'organizing as a function', 'management theories and styles', 'leadership introduction', 'leadership styles types', 'leadership styles/types', 'leadership theories', 'teamwork team planning', 'teamwork/team planning', 'teamwork', 'team planning', 'team process', 'conflict resolution', 'negotiation skills', 'financial management budgeting', 'management of equipment', 'transport management', 'business', 'business enterprise', 'entrepreneurship', 'business planning', 'business start-ups', 'business idea', 'joint stock companies', 'cooperatives', 'partnerships', 'franchising', 'money matters', 'managing business risks', 'customer care', 'marketing', 'innovation', 'key government policies', 'the entrepreneur', 'workers compensation act', 'work related injuries', 'small business in the economy', 'types/nature', 'forms of business']
  },
  // Year 3 Semester 2
  {
    id: 'dnd-321',
    code: 'DND 321',
    name: 'Pediatric Nursing',
    description: 'Child health nursing, growth, development, and childhood illnesses',
    icon: 'Baby',
    color: '#f59e0b',
    semesterId: 'year-3-semester-2',
    keywords: ['paediatrics', 'pediatric', 'growth and development of a child', 'adolescent', 'nutrition in children', 'malnutrition in children', 'immunization', 'imci', 'integrated management of childhood', 'assessing and classification of a sick child', 'sick young infant', 'measles', 'chicken pox', 'mumps', 'tetanus', 'sickle cell disease', 'eye infections in children', 'eye injuries in children', 'eating disorders in children', 'mood disorders in children', 'adhd', 'attention deficit', 'autism', 'mental retardation', 'intellectual disability', 'cerebral palsy', 'intersexual disabilities', 'neonatal', 'newborn', 'infant', 'apnea', 'hiv/aids in children', 'hiv & aids in children', 'hiv / aids treatment', 'hiv aids treatment', 'clinical manifestation of hiv', 'jaundice hyperbilirubinemia', 'jaundice', 'respiratory distress syndrome', 'meconium aspiration', 'broncho pulmonary dysplasia', 'osteopenia of prematurity', 'osteogenesis imperfecta', 'osteomyelitis', 'reye syndrome', 'reye s syndrome', 'reyes syndrome', 'reye', 'reyes', 'hydrocele', 'infertility', 'family planning', 'abortion', 'abortions', 'septic abortion', 'threatened abortion', 'incomplete abortion', 'post abortion care', 'habitual abortion', 'safe motherhood', 'ectopic pregnancy', 'dysfunctional uterine bleeding', 'care of a child under going eye surgery']
  },
  {
    id: 'dnd-322',
    code: 'DND 322',
    name: 'Mental Health Nursing',
    description: 'Psychiatric nursing, mental disorders, and therapeutic interventions',
    icon: 'Brain',
    color: '#8b5cf6',
    semesterId: 'year-3-semester-2',
    keywords: ['mental health', 'psychiatric', 'anxiety disorders', 'panic attacks and disorders', 'bipolar affective disorder', 'schizophrenia', 'catatonic stupor', 'substance abuse', 'suicide and suicidal', 'aggression and violence', 'assessment of the mentally ill', 'post traumatic stress', 'ptsd', 'general paralysis of the insane', 'gpi', 'law and mental illness']
  },
  {
    id: 'dnd-323',
    code: 'DND 323',
    name: 'Pharmacology',
    description: 'Psychotropic drugs, narcotics, and advanced pharmacology',
    icon: 'Pill',
    color: '#10b981',
    semesterId: 'year-3-semester-2',
    keywords: ['antipsychotics', 'antidepressants', 'anticonvulsants', 'mood stabilizers', 'anxiolytic and hypnotic', 'narcotics', 'storage of narcotics', 'gonadotropin drugs', 'drugs used in labor', 'hepatitis b', 'androgens', 'antineoplastic agents', 'drug classification', 'terminologies and sources of drugs', 'erectile dysfunction medications', 'erectile dysfunction', 'immunological agents']
  },
  {
    id: 'dnd-324',
    code: 'DND 324',
    name: 'Palliative Care',
    description: 'End-of-life care, pain management, and supportive care',
    icon: 'Heart',
    color: '#ec4899',
    semesterId: 'year-3-semester-2',
    keywords: ['palliative care', 'pain assessment', 'pain management', 'symptoms control', 'communication in palliative', 'breaking of bad news', 'bereavement', 'death and dying', 'nearing death awareness', 'anger issues in palliative', 'spirituality in palliative', 'advance directives in palliative', 'ethics at the end of life', 'euthanasia', 'will making', 'psychosocial support to terminally', 'palliative care emergencies']
  },
  {
    id: 'dnd-325',
    code: 'DND 325',
    name: 'Dermatology',
    description: 'Skin conditions, allergies, and dermatological nursing',
    icon: 'Hand',
    color: '#f43f5e',
    semesterId: 'year-3-semester-2',
    keywords: ['skin allergies', 'plant allergies', 'dermatitis', 'eczema', 'atopic dermatitis', 'psoriasis', 'acne vulgaris', 'onychomycosis', 'furunculosis', 'scabies', 'herpes zoster']
  },
  {
    id: 'dnd-326',
    code: 'DND 326',
    name: 'Reproductive Health & Gynaecology',
    description: 'Women health, gynaecological conditions, and HIV/AIDS management',
    icon: 'Heart',
    color: '#ec4899',
    semesterId: 'year-3-semester-2',
    keywords: ['reproductive health', 'abnormal vaginal discharge', 'cancers of reproductive health organs', 'congenital abnormalities of the reproductive organs', 'integration of reproductive health', 'family planning counseling', 'hormonal contraceptive methods', 'menstruation disorders', 'introduction to reproductive health', 'introduction to gynaecology', 'internal and external female reproductive organs', 'history physical examination and investigations in gynaecology', 'investigations in gynaecology', 'sexually transmitted diseases', 'prevention and control of hiv', 'management of hiv/aids and hepatitis', 'management of hiv', 'opportunistic infections in hiv', 'adolescent reproductive health', 'vulnerable groups in adoloscent', 'adolescent friendly health services', 'adolescent sexuality', 'drugs used in labor', 'post-exposure prophylaxis', 'pep', 'post exposure prophylaxis']
  }
];

// Semester keyword mapping for topic classification
const semesterKeywords: Record<string, string[]> = {
  'year-1-semester-1': [
    'anatomy', 'physiology', 'sociology', 'psychology', 'ethics', 'ethical',
    'microbiology', 'environmental', 'information technology', 'computer', 'internet',
    'atoms', 'molecules', 'cells', 'tissues', 'skeletal system', 'muscular',
    'terminology', 'introduction to', 'concepts of', 'history of nursing',
    'communication', 'hygiene', 'safety'
  ],
  'year-1-semester-2': [
    'nursing process', 'assessment', 'diagnosis', 'planning', 'implementation',
    'pharmacology', 'drug', 'medication', 'administration', 'injection',
    'fluid', 'electrolyte', 'iv therapy', 'blood transfusion',
    'wound', 'dressing', 'aseptic', 'infection prevention',
    'peri-operative', 'pre-operative', 'post-operative', 'surgical nursing'
  ],
  'year-2-semester-1': [
    'cardiovascular', 'heart', 'hypertension', 'heart failure', 'cardiac',
    'respiratory', 'lung', 'pneumonia', 'asthma', 'tuberculosis', 'copd',
    'gastrointestinal', 'stomach', 'intestine', 'liver', 'peptic ulcer', 'gastritis',
    'renal', 'kidney', 'urinary', 'catheterization', 'dialysis',
    'blood', 'anemia', 'hemorrhage', 'bleeding'
  ],
  'year-2-semester-2': [
    'nervous', 'neurological', 'brain', 'spinal', 'stroke', 'epilepsy', 'meningitis',
    'endocrine', 'diabetes', 'thyroid', 'hormone', 'pituitary', 'adrenal',
    'musculoskeletal', 'fracture', 'arthritis', 'orthopedic', 'bone',
    'eye', 'ophthalmology', 'ear', 'nose', 'throat', 'ent', 'vision', 'hearing'
  ],
  'year-3-semester-1': [
    'community', 'public health', 'primary health care', 'phc', 'family planning',
    'research', 'proposal', 'methodology', 'data collection', 'sampling',
    'leadership', 'management', 'supervision', 'quality assurance',
    'occupational health', 'workplace', 'disaster', 'emergency preparedness'
  ],
  'year-3-semester-2': [
    'pediatric', 'paediatric', 'child', 'infant', 'newborn', 'neonatal',
    'mental health', 'psychiatric', 'psychosis', 'depression', 'schizophrenia',
    'maternal', 'obstetric', 'pregnancy', 'antenatal', 'postnatal', 'midwifery',
    'emergency nursing', 'trauma', 'shock', 'first aid', 'resuscitation'
  ]
};

// Function to determine semester for a topic based on title and description
export function getSemesterForTopic(title: string, description: string = ''): string {
  const searchText = `${title} ${description}`.toLowerCase();
  
  for (const [semesterId, keywords] of Object.entries(semesterKeywords)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return semesterId;
      }
    }
  }
  
  return 'general'; // Default for topics that don't match
}

// Function to determine course unit for a topic
export function getCourseUnitForTopic(title: string, description: string = ''): string {
  // Normalize text: convert Unicode quotes to ASCII apostrophes
  const normalizeText = (text: string) => 
    text.toLowerCase()
      .replace(/['']/g, "'")  // Normalize curly quotes to straight apostrophe
      .replace(/[""]/g, '"'); // Normalize curly double quotes
  
  const searchText = normalizeText(`${title} ${description}`);
  
  for (const courseUnit of courseUnitsData) {
    for (const keyword of courseUnit.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return courseUnit.id;
      }
    }
  }
  
  return 'general';
}

// Get course units for a semester
export function getCourseUnitsForSemester(semesterId: string): CourseUnit[] {
  return courseUnitsData.filter(cu => cu.semesterId === semesterId);
}

// Build semesters with course units
export const semesters: Semester[] = [
  {
    id: 'year-1-semester-1',
    name: 'Year 1 Semester 1',
    year: 1,
    semester: 1,
    description: 'Foundation courses in Anatomy, Physiology, Ethics, Psychology, Sociology, Microbiology & IT',
    topics: [],
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-600',
    icon: 'Foundation',
    courseUnits: getCourseUnitsForSemester('year-1-semester-1')
  },
  {
    id: 'year-1-semester-2',
    name: 'Year 1 Semester 2',
    year: 1,
    semester: 2,
    description: 'Nursing Process, Pharmacology, Fluid & Electrolytes, Peri-operative Care',
    topics: [],
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    icon: 'HeartPulse',
    courseUnits: getCourseUnitsForSemester('year-1-semester-2')
  },
  {
    id: 'year-2-semester-1',
    name: 'Year 2 Semester 1',
    year: 2,
    semester: 1,
    description: 'Cardiovascular, Respiratory, Gastrointestinal & Renal Systems',
    topics: [],
    color: '#14b8a6',
    gradient: 'from-teal-500 to-cyan-600',
    icon: 'Activity',
    courseUnits: getCourseUnitsForSemester('year-2-semester-1')
  },
  {
    id: 'year-2-semester-2',
    name: 'Year 2 Semester 2',
    year: 2,
    semester: 2,
    description: 'Nervous System, Endocrine, Musculoskeletal, ENT & Ophthalmology',
    topics: [],
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    icon: 'Brain',
    courseUnits: getCourseUnitsForSemester('year-2-semester-2')
  },
  {
    id: 'year-3-semester-1',
    name: 'Year 3 Semester 1',
    year: 3,
    semester: 1,
    description: 'Community Health, Research Methods, Leadership & Management',
    topics: [],
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    icon: 'Users',
    courseUnits: getCourseUnitsForSemester('year-3-semester-1')
  },
  {
    id: 'year-3-semester-2',
    name: 'Year 3 Semester 2',
    year: 3,
    semester: 2,
    description: 'Pediatric Nursing, Mental Health, Maternal Health & Emergency Care',
    topics: [],
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    icon: 'Baby',
    courseUnits: getCourseUnitsForSemester('year-3-semester-2')
  }
];

// Topic count estimations per semester (will be calculated dynamically)
export const semesterTopicCounts: Record<string, number> = {
  'year-1-semester-1': 75,
  'year-1-semester-2': 65,
  'year-2-semester-1': 85,
  'year-2-semester-2': 70,
  'year-3-semester-1': 80,
  'year-3-semester-2': 82
};
