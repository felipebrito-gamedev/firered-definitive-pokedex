import { CatalogSortOrder } from '../domain/catalog-filter';

/**
 * Brazilian Portuguese user-facing copy, isolated for a future i18n layer.
 */
export const UI_MESSAGES = {
  catalog: {
    heading: 'Pokédex Nacional',
    description: 'FireRed Definitivo PT-BR v2.0.4 · 386 espécies',
    listAria: 'Lista de Pokémon',
    loadError: 'Não foi possível carregar a Pokédex neste dispositivo. Tente novamente.',
    retry: 'Tentar novamente',
    detailAria: (name: string) => `Detalhes de ${name}`,
    searchPlaceholder: 'Buscar por nome ou número',
    searchAria: 'Buscar Pokémon por nome ou número',
    clearSearch: 'Limpar busca',
    allTypes: 'Todos',
    typeFilterAria: 'Filtrar por tipo',
    sortLabel: 'Ordenar',
    sortAria: 'Ordenar resultados da Pokédex',
    showing: (shown: number, total: number) => `Exibindo ${shown} de ${total} Pokémon`,
    loading: 'Carregando Pokédex…',
    empty: 'Nenhum Pokémon encontrado com os filtros atuais.',
    openDetails: (name: string, dex: string) => `Abrir detalhes de ${name} (${dex})`,
    spriteFallback: 'Sprite indisponível',
  },
  sort: {
    id_asc: 'Número crescente',
    id_desc: 'Número decrescente',
    name_asc: 'Nome A–Z',
    bst_desc: 'BST maior',
  } satisfies Record<CatalogSortOrder, string>,
  detail: {
    close: 'Fechar detalhes',
    statsHeading: 'Atributos base',
    evolutionHeading: 'Família evolutiva',
    romCallout: 'Alterado no FireRed Definitivo',
    finalStage: 'Estágio final',
    bstLabel: 'Total',
    statLabels: {
      hp: 'HP',
      attack: 'Ataque',
      defense: 'Defesa',
      spAttack: 'Atq. Esp.',
      spDefense: 'Def. Esp.',
      speed: 'Velocidade',
      total: 'Total',
    },
  },
} as const;

export const CATALOG_SORT_OPTIONS: readonly CatalogSortOrder[] = [
  'id_asc',
  'id_desc',
  'name_asc',
  'bst_desc',
];
