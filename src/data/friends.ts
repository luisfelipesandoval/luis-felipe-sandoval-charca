export interface FriendItem {
  id: string;
  name: string;
  description: string;
  url: string;
  displayUrl?: string;
}

/**
 * ============================================================================
 * LISTA DE AMIGOS Y COMPAÑEROS (FÁCIL DE EDITAR)
 * ============================================================================
 * Para agregar, editar o eliminar amigos en la pestaña "Amigos":
 * 1. Modifica los objetos existentes dentro del arreglo `FRIENDS_LIST` o copia
 *    y pega un nuevo bloque `{ id, name, description, url, displayUrl }`.
 * 2. Reemplaza `url: "#"` por el enlace real de la página web o perfil de
 *    LinkedIn/GitHub de tu compañero(a).
 * ============================================================================
 */
export const FRIENDS_LIST: FriendItem[] = [
  {
    id: 'jhon-gutierrez',
    name: 'Jhon Gutierrez – Compañero de UCSP',
    description:
      'Página personal y portafolio académico de Jhon Gutierrez, compañero de estudios en la Universidad Católica San Pablo (UCSP) en el curso de Introducción a la Computación.',
    url: 'https://jhongutierrez-stack.github.io/',
    displayUrl: 'https://jhongutierrez-stack.github.io',
  },
  {
    id: 'amigo-2',
    name: 'Compañero(a) de UCSP 2 – Introducción a la Computación',
    description:
      'Compañero de estudios en la Universidad Católica San Pablo en Arequipa. Apasionado por la innovación digital, el análisis de negocios y el desarrollo de presencia web.',
    url: '#',
    displayUrl: 'https://ucsp.edu.pe › estudiantes › companero-2',
  },
  {
    id: 'amigo-3',
    name: 'Compañero(a) de UCSP 3 – Proyectos y Diseño',
    description:
      'Amigo y compañero de equipo en la UCSP. Enfocado en marketing estratégico, comunicación visual y herramientas tecnológicas aplicadas a los negocios modernos.',
    url: '#',
    displayUrl: 'https://ucsp.edu.pe › estudiantes › companero-3',
  },
];
