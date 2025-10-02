import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SpeciesEntity } from '../app/entities/species.entity';
import { SpeciesCommonNameEntity } from '../app/entities/species-common-name.entity';
import * as fs from 'fs';
import * as path from 'path';

// Type for the JSON file structure
interface SpeciesData {
  birdID: string;
  commonName: string;
  scientificName: string;
}

// Extract language code from filename
function extractLanguageFromFilename(filePath: string): string {
  const filename = path.basename(filePath);
  const match = filename.match(/argentina-([a-z]{2}_[A-Z]{2})\.json$/);
  if (match) {
    return match[1];
  }
  throw new Error(
    'Filename must match pattern: argentina-{langCode}.json (e.g., argentina-es_AR.json, argentina-en_US.json)'
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

async function populateArgentinaSpecies(filePath: string) {
  // Extract language code from filename
  const langCode = extractLanguageFromFilename(filePath);
  console.log(`Detected language code: ${langCode}`);

  // Load species data from JSON file
  const argentinaSpecies = loadSpeciesData(filePath);

  // Create DataSource with the same configuration as your app
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'birdguide',
    entities: [SpeciesEntity, SpeciesCommonNameEntity],
    synchronize: false, // Don't auto-sync, we're just inserting data
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const speciesRepository = dataSource.getRepository(SpeciesEntity);
    const commonNameRepository = dataSource.getRepository(
      SpeciesCommonNameEntity
    );

    for (const speciesData of argentinaSpecies) {
      console.log(`Processing ${speciesData.scientificName}...`);

      // Check if species already exists
      let existingSpecies = await speciesRepository.findOne({
        where: { eBirdId: speciesData.birdID },
      });

      if (!existingSpecies) {
        // Create new species only if it doesn't exist
        const species = speciesRepository.create({
          scientificName: speciesData.scientificName,
          eBirdId: speciesData.birdID,
          // Set some default values for required fields
          genus: speciesData.scientificName.split(' ')[0],
          // family, orderName, and iucnStatus are nullable - don't set defaults
          sizeMm: null,
          summary: null,
          rangeMapUrl: null,
        });

        const savedSpecies = await speciesRepository.save(species);
        existingSpecies = savedSpecies; // Update reference to the saved species
        console.log(
          `Created species: ${savedSpecies.scientificName} (ID: ${savedSpecies.id})`
        );
      } else {
        console.log(
          `Species ${speciesData.scientificName} already exists (ID: ${existingSpecies.id}), adding common name...`
        );
      }

      // Check if common name already exists for this species and language
      const existingCommonName = await commonNameRepository.findOne({
        where: {
          speciesId: existingSpecies.id,
          langCode: langCode,
          commonName: speciesData.commonName,
        },
      });

      if (existingCommonName) {
        console.log(
          `Common name "${speciesData.commonName}" for ${speciesData.scientificName} already exists in ${langCode}. Skipping.`
        );
        continue;
      }

      // Create common name entry (for existing or new species)
      const speciesId = existingSpecies.id;
      const commonName = commonNameRepository.create({
        speciesId: speciesId,
        langCode: langCode,
        commonName: speciesData.commonName,
      });

      await commonNameRepository.save(commonName);
      console.log(
        `Created common name: ${speciesData.commonName} for ${speciesData.scientificName} (${langCode})`
      );
    }

    console.log(`✅ Successfully populated species data for ${langCode}!`);
  } catch (error) {
    console.error('❌ Error populating species data:', error);
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
  console.log('Usage: npm run populate:argentina <path-to-json-file>');
  console.log('Examples:');
  console.log(
    '  npm run populate:argentina /Users/gonzalogm/Downloads/argentina-es_AR.json'
  );
  console.log(
    '  npm run populate:argentina /Users/gonzalogm/Downloads/argentina-en_US.json'
  );
  process.exit(1);
}

// Run the script
populateArgentinaSpecies(filePath);
