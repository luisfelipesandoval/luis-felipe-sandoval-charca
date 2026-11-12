/**
 * ============================================================================
 * FOTO DE PERFIL (FÁCIL DE REEMPLAZAR)
 * ============================================================================
 * Para usar tu propia foto de perfil en el Panel de Conocimiento:
 * 1. Coloca tu imagen (por ejemplo `mi-foto.jpg`) dentro de la carpeta `/public/`
 *    y cambia `PROFILE_PHOTO_URL` a `"/mi-foto.jpg"`, o pega la URL directa de
 *    tu foto.
 * 2. Si `PROFILE_PHOTO_URL` está vacío (`""`), se mostrará automáticamente el
 *    placeholder circular con tus iniciales "LF".
 * ============================================================================
 */
export const PROFILE_PHOTO_URL: string = '/assets/aistudio/image_5eb07b3c.png';

export interface SearchResultItem {
  id: string;
  siteName: string;
  displayUrl: string;
  title: string;
  description: string;
  href: string;
  isExternal: boolean;
  secondaryLink?: {
    label: string;
    href: string;
  };
}

export interface PeopleAlsoSearchItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  isExternal: boolean;
  initials: string;
  accentColor: string;
}

export const SEO_CONFIG = {
  title: 'Luis Felipe Sandoval Charca | Administración de Negocios – UCSP',
  description:
    'Página personal de Luis Felipe Sandoval Charca, estudiante de Administración de Negocios en la Universidad Católica San Pablo (UCSP) apasionado por el diseño.',
  canonicalPlaceholder: 'https://tu-dominio-en-vercel.vercel.app/',
};

export const PROFILE_DATA = {
  fullName: 'Luis Felipe Sandoval Charca',
  shortName: 'Luis Felipe',
  initials: 'LF',
  subtitle: 'Estudiante de Administración de Negocios en UCSP',
  age: '23 años',
  career: {
    name: 'Administración de Negocios',
    url: 'https://ucsp.edu.pe/carreras/administracion-negocios/?tab=institucional',
    linkLabel: 'Carrera de Administración de Negocios en la UCSP',
  },
  university: {
    name: 'Universidad Católica San Pablo',
    shortName: 'UCSP',
    url: 'https://ucsp.edu.pe/',
    linkLabel: 'Sitio web oficial de la Universidad Católica San Pablo (UCSP)',
  },
  course: {
    name: 'Introducción a la Computación',
  },
  professor: {
    name: 'Ernesto Cuadros Vargas',
    url: 'https://www.linkedin.com/in/ecuadrosv/',
    linkLabel: 'Perfil de LinkedIn del profesor Ernesto Cuadros Vargas',
  },
  interests: ['diseño audiovisual', 'diseño gráfico', 'edición de videos'],
  linkedin: {
    url: 'https://www.linkedin.com/in/luis-felipe-sandoval-316935175/',
    label: 'LinkedIn de Luis Felipe Sandoval Charca',
  },
};

export const MAIN_SEARCH_RESULTS: SearchResultItem[] = [
  {
    id: 'sobre-mi',
    siteName: 'Luis Felipe Sandoval Charca',
    displayUrl: 'https://luis-felipe-sandoval.vercel.app › sobre-mi',
    title: 'Sobre mí – Luis Felipe Sandoval Charca',
    description:
      '¡Hola! Soy Luis Felipe Sandoval Charca, tengo 23 años y soy estudiante de Administración de Negocios en la Universidad Católica San Pablo (UCSP). Me apasiona combinar la visión estratégica de los negocios con la creatividad visual, desarrollando proyectos que comunican ideas con impacto y claridad.',
    href: 'https://www.linkedin.com/in/luis-felipe-sandoval-316935175/',
    isExternal: true,
  },
  {
    id: 'mi-carrera',
    siteName: 'Universidad Católica San Pablo',
    displayUrl: 'https://ucsp.edu.pe › carreras › administracion-negocios',
    title: 'Mi carrera: Administración de Negocios, UCSP',
    description:
      'Formación integral en dirección de empresas, liderazgo ético, marketing, finanzas y gestión estratégica en la Universidad Católica San Pablo. Conoce el plan de estudios institucional de Administración de Negocios en la UCSP.',
    href: 'https://ucsp.edu.pe/carreras/administracion-negocios/?tab=institucional',
    isExternal: true,
    secondaryLink: {
      label: 'Portal principal de la Universidad Católica San Pablo (UCSP)',
      href: 'https://ucsp.edu.pe/',
    },
  },
  {
    id: 'mis-intereses',
    siteName: 'Portafolio Creativo · Luis Felipe',
    displayUrl: 'https://luis-felipe-sandoval.vercel.app › intereses-creativos',
    title: 'Mis intereses: diseño audiovisual, gráfico y edición de video',
    description:
      'Exploro de forma constante el diseño audiovisual, el diseño gráfico y la edición de videos. Disfruto transformar conceptos en piezas visuales dinámicas, cuidando el ritmo narrativo, la composición tipográfica y la identidad visual en cada proyecto.',
    href: 'https://www.linkedin.com/in/luis-felipe-sandoval-316935175/',
    isExternal: true,
  },
  {
    id: 'mi-linkedin',
    siteName: 'LinkedIn',
    displayUrl: 'https://www.linkedin.com › in › luis-felipe-sandoval-316935175',
    title: 'Mi LinkedIn – Luis Felipe Sandoval Charca | Perfil Profesional',
    description:
      'Conecta conmigo en LinkedIn para conocer mi trayectoria académica en la Universidad Católica San Pablo, mis habilidades en gestión de negocios, diseño gráfico y producción audiovisual, así como futuras colaboraciones profesionales.',
    href: 'https://www.linkedin.com/in/luis-felipe-sandoval-316935175/',
    isExternal: true,
  },
  {
    id: 'introduccion-computacion',
    siteName: 'Curso Académico UCSP',
    displayUrl: 'https://www.linkedin.com › in › ecuadrosv',
    title: 'Introducción a la Computación – Curso y Profesor en UCSP',
    description:
      'Asignatura fundamental donde comprendemos el funcionamiento de la tecnología, el posicionamiento web (SEO) y el desarrollo de presencia digital profesional, dictada por el profesor Ernesto Cuadros Vargas.',
    href: 'https://www.linkedin.com/in/ecuadrosv/',
    isExternal: true,
    secondaryLink: {
      label: 'Perfil de LinkedIn del profesor Ernesto Cuadros Vargas',
      href: 'https://www.linkedin.com/in/ecuadrosv/',
    },
  },
];

export const PEOPLE_ALSO_SEARCH: PeopleAlsoSearchItem[] = [
  {
    id: 'pas-ucsp',
    title: 'Universidad Católica San Pablo',
    subtitle: 'Universidad en Arequipa, Perú',
    href: 'https://ucsp.edu.pe/',
    isExternal: true,
    initials: 'UC',
    accentColor: '#4285F4',
  },
  {
    id: 'pas-adm',
    title: 'Administración de Negocios UCSP',
    subtitle: 'Carrera profesional universitaria',
    href: 'https://ucsp.edu.pe/carreras/administracion-negocios/?tab=institucional',
    isExternal: true,
    initials: 'AN',
    accentColor: '#EA4335',
  },
  {
    id: 'pas-profesor',
    title: 'Ernesto Cuadros Vargas',
    subtitle: 'Docente de Introducción a la Computación',
    href: 'https://www.linkedin.com/in/ecuadrosv/',
    isExternal: true,
    initials: 'EC',
    accentColor: '#FBBC05',
  },
  {
    id: 'pas-linkedin',
    title: 'LinkedIn de Luis Felipe Sandoval',
    subtitle: 'Red profesional y portafolio',
    href: 'https://www.linkedin.com/in/luis-felipe-sandoval-316935175/',
    isExternal: true,
    initials: 'LF',
    accentColor: '#34A853',
  },
];
