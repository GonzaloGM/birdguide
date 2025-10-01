# @birdguide/shared-types

A shared TypeScript types library for the BirdGuide birding application, designed to be used by both the NestJS backend API and React frontend applications.

## Overview

This library contains birding-specific TypeScript types and interfaces that are shared between the backend and frontend applications, ensuring type safety and consistency across the entire BirdGuide application stack. It includes types for birds, bird sightings, users, weather conditions, and more.

## Installation

This library is automatically available in the NX workspace. No additional installation is required.

## Usage

### In NestJS API

```typescript
import { Bird, BirdSighting, ApiResponse, CreateBirdSightingRequest } from '@birdguide/shared-types';

@Controller('birds')
export class BirdsController {
  @Get()
  getBirds(): ApiResponse<Bird[]> {
    const birds: Bird[] = [
      {
        id: '1',
        commonName: 'American Robin',
        scientificName: 'Turdus migratorius',
        family: 'Turdidae',
        order: 'Passeriformes',
        conservationStatus: 'Least Concern',
        habitat: ['Forest', 'Urban', 'Parks'],
        size: 'Medium',
        colors: ['Brown', 'Orange', 'White'],
        description: 'A common North American songbird',
        imageUrl: 'https://example.com/robin.jpg',
        audioUrl: 'https://example.com/robin.mp3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      success: true,
      data: birds,
    };
  }

  @Post('sightings')
  createSighting(@Body() createSightingDto: CreateBirdSightingRequest): ApiResponse<BirdSighting> {
    // Implementation here
  }
}
```

### In React Frontend

```typescript
import { Bird, BirdSighting, ApiResponse, User } from '@birdguide/shared-types';

interface BirdSightingCardProps {
  sighting: BirdSighting;
  bird: Bird;
  user: User;
}

export function BirdSightingCard({ sighting, bird, user }: BirdSightingCardProps) {
  return (
    <div className="sighting-card">
      <h3>{bird.commonName}</h3>
      <p className="scientific-name">{bird.scientificName}</p>
      <p>Spotted by {user.username} on {sighting.dateTime.toLocaleDateString()}</p>
      <p>Location: {sighting.location.address}</p>
      <p>Count: {sighting.count}</p>
      {sighting.notes && <p>Notes: {sighting.notes}</p>}
      <div className="weather-info">
        <span>Temperature: {sighting.weather.temperature}°C</span>
        <span>Weather: {sighting.weather.precipitation}</span>
      </div>
    </div>
  );
}
```

## Available Types

### Core Types

- **Bird**: Bird entity with scientific classification, conservation status, and characteristics
- **BirdSighting**: Bird sighting record with location, weather, and observation details
- **User**: User entity with profile information and birding preferences
- **Location**: Geographic location with coordinates and habitat information
- **ApiResponse<T>**: Generic API response wrapper with success/error handling
- **PaginatedResponse<T>**: Paginated data response with pagination metadata

### Birding-Specific Types

- **ConservationStatus**: IUCN conservation status levels
- **BirdSize**: Size categories from Very Small to Very Large
- **WeatherConditions**: Detailed weather data for sighting context
- **BirdSearchFilters**: Search and filter options for bird data
- **SightingSearchFilters**: Search and filter options for sightings
- **UserStats**: User statistics and birding achievements
- **BirdStats**: Bird population and sighting statistics

### Request/Response Types

- **CreateUserRequest**: User creation payload
- **UpdateUserRequest**: User update payload
- **CreateTripRequest**: Trip creation payload
- **UpdateTripRequest**: Trip update payload
- **LoginRequest**: Authentication payload
- **AuthResponse**: Authentication response with user and tokens

## Development

### Building

```bash
nx build shared-types
```

### Testing

```bash
nx test shared-types
```

### Type Checking

```bash
nx typecheck shared-types
```

### Linting

```bash
nx lint shared-types
```

## Adding New Types

When adding new shared types:

1. Define the type in the appropriate file (`src/index.ts` or `src/types.ts`)
2. Export it from `src/index.ts`
3. Add tests in `src/shared-types.test.ts`
4. Update this README with usage examples

## Best Practices

- Keep types focused and specific to the domain
- Use descriptive names that clearly indicate the type's purpose
- Group related types together
- Avoid circular dependencies between type files
- Always include proper TypeScript documentation for complex types
- Test type definitions with realistic data structures

## Configuration

The library is configured with:
- TypeScript strict mode enabled
- CommonJS module format for maximum compatibility
- Proper path mapping in `tsconfig.base.json`
- Jest for testing
- ESLint for code quality
