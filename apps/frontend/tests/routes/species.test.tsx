import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import SpeciesPage from '../../app/routes/species';
import { renderWithI18n } from '../../app/test-utils';
import type { SpeciesWithCommonName } from '@birdguide/shared-types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variable
vi.mock('import.meta', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000/api',
  },
}));

const mockSpecies: SpeciesWithCommonName[] = [
  {
    id: 1,
    scientificName: 'Turdus migratorius',
    eBirdId: 'amerob',
    commonName: 'American Robin',
    genus: 'Turdus',
    family: 'Turdidae',
    orderName: 'Passeriformes',
    iucnStatus: 'LC',
    sizeMm: 250,
    summary: 'A common North American thrush',
    rangeMapUrl: 'https://example.com/range-map.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    scientificName: 'Cardinalis cardinalis',
    eBirdId: 'norcar',
    commonName: 'Northern Cardinal',
    genus: 'Cardinalis',
    family: 'Cardinalidae',
    orderName: 'Passeriformes',
    iucnStatus: 'LC',
    sizeMm: 220,
    summary: 'A bright red songbird',
    rangeMapUrl: 'https://example.com/range-map-2.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('SpeciesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithI18n(<SpeciesPage />);

    expect(screen.getByText('Loading species...')).toBeInTheDocument();
  });

  it('should display species list when data loads successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      expect(screen.getByText('Bird Species')).toBeInTheDocument();
    });

    expect(screen.getByText('American Robin')).toBeInTheDocument();
    expect(screen.getByText('Turdus migratorius')).toBeInTheDocument();
    expect(screen.getByText('Northern Cardinal')).toBeInTheDocument();
    expect(screen.getByText('Cardinalis cardinalis')).toBeInTheDocument();
  });

  it('should display species without common name when commonName is null', async () => {
    const speciesWithoutCommonName: SpeciesWithCommonName[] = [
      {
        ...mockSpecies[0],
        commonName: null,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: speciesWithoutCommonName,
      }),
    });

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      expect(screen.getByText('No common name')).toBeInTheDocument();
    });
  });

  it('should display error message when API call fails', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: false,
        message: 'Failed to fetch species',
      }),
    });

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Failed to fetch species')
      ).toBeInTheDocument();
    });
  });

  it('should display network error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Network error occurred')
      ).toBeInTheDocument();
    });
  });

  it('should make correct API call to fetch species', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/species'
      );
    });
  });

  it('should render species as clickable links', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', '/species/1');
      expect(links[1]).toHaveAttribute('href', '/species/2');
    });
  });

  it('should display family information for each species', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      expect(screen.getByText('Turdidae')).toBeInTheDocument();
      expect(screen.getByText('Cardinalidae')).toBeInTheDocument();
    });
  });

  it('should display species sorted by common name alphabetically', async () => {
    const unsortedSpecies: SpeciesWithCommonName[] = [
      {
        id: 3,
        scientificName: 'Zenaida macroura',
        eBirdId: 'moudov',
        commonName: 'Mourning Dove',
        genus: 'Zenaida',
        family: 'Columbidae',
        orderName: 'Columbiformes',
        iucnStatus: 'LC',
        sizeMm: 300,
        summary: 'A common North American dove',
        rangeMapUrl: 'https://example.com/range-map-3.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 1,
        scientificName: 'Turdus migratorius',
        eBirdId: 'amerob',
        commonName: 'American Robin',
        genus: 'Turdus',
        family: 'Turdidae',
        orderName: 'Passeriformes',
        iucnStatus: 'LC',
        sizeMm: 250,
        summary: 'A common North American thrush',
        rangeMapUrl: 'https://example.com/range-map.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        scientificName: 'Cardinalis cardinalis',
        eBirdId: 'norcar',
        commonName: 'Northern Cardinal',
        genus: 'Cardinalis',
        family: 'Cardinalidae',
        orderName: 'Passeriformes',
        iucnStatus: 'LC',
        sizeMm: 220,
        summary: 'A bright red songbird',
        rangeMapUrl: 'https://example.com/range-map-2.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: unsortedSpecies,
      }),
    });

    renderWithI18n(<SpeciesPage />);

    await waitFor(() => {
      const speciesLinks = screen.getAllByRole('link');
      expect(speciesLinks).toHaveLength(3);

      // Should be sorted alphabetically by common name
      expect(speciesLinks[0]).toHaveTextContent('American Robin');
      expect(speciesLinks[1]).toHaveTextContent('Mourning Dove');
      expect(speciesLinks[2]).toHaveTextContent('Northern Cardinal');
    });
  });
});
