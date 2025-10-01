import {
  Species,
  User,
  ApiResponse,
  PaginatedResponse,
  ConservationStatus,
  BirdSize,
  WeatherConditions,
  Location,
} from './index';

describe('BirdGuide Shared Types', () => {
  it('should define Species type correctly', () => {
    const species: Species = {
      id: '1',
      scientificName: 'Turdus migratorius',
      genus: 'Turdus',
      family: 'Turdidae',
      orderName: 'Passeriformes',
      iucnStatus: 'LC',
      sizeMm: 250, // 25cm in mm
      summary: 'A common North American songbird',
      rangeMapUrl: 'https://example.com/range-map.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(species.id).toBe('1');
    expect(species.scientificName).toBe('Turdus migratorius');
    expect(species.genus).toBe('Turdus');
    expect(species.family).toBe('Turdidae');
    expect(species.iucnStatus).toBe('LC');
    expect(species.sizeMm).toBe(250);
  });

  it('should define User type correctly', () => {
    const user: User = {
      id: '1',
      email: 'birder@example.com',
      displayName: 'John Doe',
      preferredLocale: 'es-AR',
      preferredRegionId: 'region-1',
      xp: 1250,
      currentStreak: 7,
      longestStreak: 15,
      lastActiveAt: new Date(),
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(user.id).toBe('1');
    expect(user.email).toBe('birder@example.com');
    expect(user.displayName).toBe('John Doe');
    expect(user.preferredLocale).toBe('es-AR');
    expect(user.xp).toBe(1250);
    expect(user.currentStreak).toBe(7);
    expect(user.isAdmin).toBe(false);
  });

  it('should define ApiResponse type correctly', () => {
    const successResponse: ApiResponse<Species> = {
      success: true,
      data: {
        id: '1',
        scientificName: 'Turdus migratorius',
        genus: 'Turdus',
        family: 'Turdidae',
        orderName: 'Passeriformes',
        iucnStatus: 'LC',
        sizeMm: 250,
        summary: 'A common North American songbird',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const errorResponse: ApiResponse<Species> = {
      success: false,
      error: 'Species not found',
    };

    expect(successResponse.success).toBe(true);
    expect(successResponse.data).toBeDefined();
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe('Species not found');
  });

  it('should define PaginatedResponse type correctly', () => {
    const paginatedResponse: PaginatedResponse<Species> = {
      data: [
        {
          id: '1',
          scientificName: 'Turdus migratorius',
          genus: 'Turdus',
          family: 'Turdidae',
          orderName: 'Passeriformes',
          iucnStatus: 'LC',
          sizeMm: 250,
          summary: 'A common North American songbird',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          scientificName: 'Cyanocitta cristata',
          genus: 'Cyanocitta',
          family: 'Corvidae',
          orderName: 'Passeriformes',
          iucnStatus: 'LC',
          sizeMm: 300,
          summary: 'A colorful North American corvid',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    };

    expect(paginatedResponse.data).toHaveLength(2);
    expect(paginatedResponse.pagination.page).toBe(1);
    expect(paginatedResponse.pagination.total).toBe(2);
  });

  it('should define WeatherConditions type correctly', () => {
    const weather: WeatherConditions = {
      temperature: 20,
      humidity: 70,
      windSpeed: 15,
      windDirection: 'SE',
      precipitation: 'Light Rain',
      cloudCover: 60,
      visibility: 8,
    };

    expect(weather.temperature).toBe(20);
    expect(weather.humidity).toBe(70);
    expect(weather.precipitation).toBe('Light Rain');
  });
});
