import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SpeciesEntity } from '../app/entities/species.entity';
import { SpeciesCommonNameEntity } from '../app/entities/species-common-name.entity';
import { SpeciesMediaEntity } from '../app/entities/species-media.entity';
import * as fs from 'fs';
import * as path from 'path';

// Type for the JSON file structure
interface MediaItem {
  url: string;
  MLId: string;
  contributor: string;
  date: string;
  location: string;
}

interface SpeciesData {
  birdID: string;
  commonName: string;
  scientificName: string;
  photos: MediaItem[];
  sounds: MediaItem[];
}

// Extract language code from filename
function extractLanguageFromFilename(filePath: string): string {
  const filename = path.basename(filePath);
  const match = filename.match(
    /argentina-photo-sound-([a-z]{2}-[A-Z]{2})_finished\.json$/
  );
  if (match) {
    return match[1];
  }
  throw new Error(
    'Filename must match pattern: argentina-photo-sound-{langCode}_finished.json (e.g., argentina-photo-sound-es-AR_finished.json)'
  );
}

// Load species data from JSON file
function loadSpeciesData(filePath: string): SpeciesData[] {
  try {
    const fullPath = path.resolve(filePath);
    console.log(`Loading species data from: ${fullPath}`);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }

    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const speciesData = JSON.parse(fileContent);

    if (!Array.isArray(speciesData)) {
      throw new Error('JSON file must contain an array of species objects');
    }

    console.log(`Loaded ${speciesData.length} species from file`);
    return speciesData;
  } catch (error) {
    console.error('Error loading species data:', error);
    process.exit(1);
  }
}

// Generate attribution text
function generateAttributionText(
  mediaItem: MediaItem,
  mediaType: string
): string {
  const source = 'Macaulay Library, Cornell Lab of Ornithology';
  return `${mediaItem.contributor} / ${source}`;
}

async function populateSpeciesMedia(filePath: string) {
  // Extract language code from filename
  const langCode = extractLanguageFromFilename(filePath);
  console.log(`Detected language code: ${langCode}`);

  // Load species data from JSON file
  const speciesData = loadSpeciesData(filePath);

  // Create DataSource with the same configuration as your app
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'birdguide',
    entities: [SpeciesEntity, SpeciesCommonNameEntity, SpeciesMediaEntity],
    synchronize: false, // Don't auto-sync, we're just inserting data
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const speciesRepository = dataSource.getRepository(SpeciesEntity);
    const commonNameRepository = dataSource.getRepository(
      SpeciesCommonNameEntity
    );
    const mediaRepository = dataSource.getRepository(SpeciesMediaEntity);

    let totalPhotos = 0;
    let totalSounds = 0;
    let speciesProcessed = 0;

    for (const speciesDataItem of speciesData) {
      console.log(`Processing ${speciesDataItem.scientificName}...`);

      // Find species by eBirdId
      const species = await speciesRepository.findOne({
        where: { eBirdId: speciesDataItem.birdID },
      });

      if (!species) {
        console.log(
          `Species ${speciesDataItem.scientificName} (${speciesDataItem.birdID}) not found. Skipping.`
        );
        continue;
      }

      // Process photos
      for (let i = 0; i < speciesDataItem.photos.length; i++) {
        const photo = speciesDataItem.photos[i];

        // Check if media already exists
        const existingPhoto = await mediaRepository.findOne({
          where: {
            speciesId: species.id,
            mediaType: 'photo',
            sourceId: photo.MLId,
          },
        });

        if (existingPhoto) {
          console.log(`  Photo ${photo.MLId} already exists. Skipping.`);
          continue;
        }

        const photoMedia = mediaRepository.create({
          speciesId: species.id,
          mediaType: 'photo',
          url: photo.url,
          contributor: photo.contributor,
          source: 'macaulay',
          sourceId: photo.MLId,
          attributionText: generateAttributionText(photo, 'photo'),
          qualityRank: 1, // Default quality
          isDefault: i === 0, // First photo is default
          date: photo.date,
          location: photo.location,
        });

        await mediaRepository.save(photoMedia);
        totalPhotos++;
        console.log(`  Added photo: ${photo.MLId}`);
      }

      // Process sounds
      for (let i = 0; i < speciesDataItem.sounds.length; i++) {
        const sound = speciesDataItem.sounds[i];

        // Check if media already exists
        const existingSound = await mediaRepository.findOne({
          where: {
            speciesId: species.id,
            mediaType: 'audio',
            sourceId: sound.MLId,
          },
        });

        if (existingSound) {
          console.log(`  Sound ${sound.MLId} already exists. Skipping.`);
          continue;
        }

        const soundMedia = mediaRepository.create({
          speciesId: species.id,
          mediaType: 'audio',
          url: sound.url,
          contributor: sound.contributor,
          source: 'macaulay',
          sourceId: sound.MLId,
          attributionText: generateAttributionText(sound, 'audio'),
          qualityRank: 1, // Default quality
          isDefault: i === 0, // First sound is default
          date: sound.date,
          location: sound.location,
        });

        await mediaRepository.save(soundMedia);
        totalSounds++;
        console.log(`  Added sound: ${sound.MLId}`);
      }

      speciesProcessed++;
    }

    console.log(`✅ Successfully populated media data!`);
    console.log(`📊 Summary:`);
    console.log(`  - Species processed: ${speciesProcessed}`);
    console.log(`  - Photos added: ${totalPhotos}`);
    console.log(`  - Sounds added: ${totalSounds}`);
  } catch (error) {
    console.error('❌ Error populating media data:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Error: Please provide the path to the JSON file');
  console.log('Usage: npm run populate:media <path-to-json-file>');
  console.log('Examples:');
  console.log(
    '  npm run populate:media /Users/gonzalogm/Downloads/argentina-photo-sound-es_AR_finished.json'
  );
  process.exit(1);
}

// Run the script
populateSpeciesMedia(filePath);
