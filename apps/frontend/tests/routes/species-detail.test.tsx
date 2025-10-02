import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeciesDetailPage from '../../app/routes/species-detail';
import { renderWithI18n } from '../../app/test-utils';
// Define the type locally for testing
type SpeciesWithCommonName = {
  id: number;
  scientificName: string;
  eBirdId: string;
  commonName: string | null;
  genus?: string;
  family?: string;
  orderName?: string;
  iucnStatus?: string;
  sizeMm?: number;
  summary?: string;
  rangeMapUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock environment variable
vi.mock('import.meta', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000/api',
  },
}));

// Mock useParams to return the species ID
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

const mockSpecies: SpeciesWithCommonName = {
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
};

describe('SpeciesDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('es-AR');
  });

  it('should display loading state initially', () => {
    mockFetch.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves to keep loading state
        })
    );

    renderWithI18n(<SpeciesDetailPage />);

    expect(
      screen.getByText('Cargando detalles de la especie...')
    ).toBeInTheDocument();
  });

  it('should display species details when data loads successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('American Robin')).toBeInTheDocument();
    });

    expect(screen.getByText('Turdus migratorius')).toBeInTheDocument();
    expect(screen.getByText('Turdidae')).toBeInTheDocument();
    expect(screen.getByText('Turdus')).toBeInTheDocument();
    expect(screen.getByText('Passeriformes')).toBeInTheDocument();
    expect(screen.getByText('LC')).toBeInTheDocument();
    expect(screen.getByText('250mm')).toBeInTheDocument();
    expect(
      screen.getByText('A common North American thrush')
    ).toBeInTheDocument();
  });

  it('should display species without common name when commonName is null', async () => {
    const speciesWithoutCommonName: SpeciesWithCommonName = {
      id: mockSpecies.id,
      scientificName: mockSpecies.scientificName,
      eBirdId: mockSpecies.eBirdId,
      commonName: null,
      genus: mockSpecies.genus,
      family: mockSpecies.family,
      orderName: mockSpecies.orderName,
      iucnStatus: mockSpecies.iucnStatus,
      sizeMm: mockSpecies.sizeMm,
      summary: mockSpecies.summary,
      rangeMapUrl: mockSpecies.rangeMapUrl,
      createdAt: mockSpecies.createdAt,
      updatedAt: mockSpecies.updatedAt,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: speciesWithoutCommonName,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Sin nombre común')).toBeInTheDocument();
    });
  });

  it('should display error message when API call fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        message: 'Species not found',
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Species not found')).toBeInTheDocument();
    });
  });

  it('should display network error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Error: Ocurrió un error de red')
      ).toBeInTheDocument();
    });
  });

  it('should display species not found when data is null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: null,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Especie no encontrada')).toBeInTheDocument();
    });
  });

  it('should make correct API call to fetch species by id with language parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/species/1?lang=es-AR'
      );
    });
  });

  it('should display back to species list link', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      const backLink = screen.getByText('← Volver a la Lista de Especies');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/species');
    });
  });

  it('should display unknown for missing optional fields', async () => {
    const speciesWithMissingFields: SpeciesWithCommonName = {
      id: mockSpecies.id,
      scientificName: mockSpecies.scientificName,
      eBirdId: mockSpecies.eBirdId,
      commonName: mockSpecies.commonName,
      genus: undefined,
      family: undefined,
      orderName: undefined,
      iucnStatus: undefined,
      sizeMm: undefined,
      summary: undefined,
      rangeMapUrl: mockSpecies.rangeMapUrl,
      createdAt: mockSpecies.createdAt,
      updatedAt: mockSpecies.updatedAt,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: speciesWithMissingFields,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('No disponible')).toHaveLength(5);
    });
  });

  it('should not display description section when summary is missing', async () => {
    const speciesWithoutSummary: SpeciesWithCommonName = {
      id: mockSpecies.id,
      scientificName: mockSpecies.scientificName,
      eBirdId: mockSpecies.eBirdId,
      commonName: mockSpecies.commonName,
      genus: mockSpecies.genus,
      family: mockSpecies.family,
      orderName: mockSpecies.orderName,
      iucnStatus: mockSpecies.iucnStatus,
      sizeMm: mockSpecies.sizeMm,
      summary: undefined,
      rangeMapUrl: mockSpecies.rangeMapUrl,
      createdAt: mockSpecies.createdAt,
      updatedAt: mockSpecies.updatedAt,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: speciesWithoutSummary,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.queryByText('Descripción')).not.toBeInTheDocument();
    });
  });
});
