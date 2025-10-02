import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpeciesDetailPage from '../../app/routes/species-detail';
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

// Mock useParams to return the species ID
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
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
  });

  it('should display loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithI18n(<SpeciesDetailPage />);

    expect(screen.getByText('Loading species details...')).toBeInTheDocument();
  });

  it('should display species details when data loads successfully', async () => {
    mockFetch.mockResolvedValueOnce({
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
      ...mockSpecies,
      commonName: null,
    };

    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: speciesWithoutCommonName,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('No common name')).toBeInTheDocument();
    });
  });

  it('should display error message when API call fails', async () => {
    mockFetch.mockResolvedValueOnce({
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
        screen.getByText('Error: Network error occurred')
      ).toBeInTheDocument();
    });
  });

  it('should display species not found when data is null', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: null,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Species not found')).toBeInTheDocument();
    });
  });

  it('should make correct API call to fetch species by id', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/species/1'
      );
    });
  });

  it('should display back to species list link', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockSpecies,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      const backLink = screen.getByText('← Back to Species List');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/species');
    });
  });

  it('should display unknown for missing optional fields', async () => {
    const speciesWithMissingFields: SpeciesWithCommonName = {
      ...mockSpecies,
      family: undefined,
      genus: undefined,
      orderName: undefined,
      iucnStatus: undefined,
      sizeMm: undefined,
      summary: undefined,
    };

    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: speciesWithMissingFields,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Not available')).toHaveLength(5);
    });
  });

  it('should not display description section when summary is missing', async () => {
    const speciesWithoutSummary: SpeciesWithCommonName = {
      ...mockSpecies,
      summary: undefined,
    };

    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: speciesWithoutSummary,
      }),
    });

    renderWithI18n(<SpeciesDetailPage />);

    await waitFor(() => {
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });
});
