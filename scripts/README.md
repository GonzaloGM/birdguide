# Database Population Scripts

## Argentina Species Population

This script populates the database with Argentina bird species data.

### Usage

1. Make sure your database is running and accessible
2. Set your environment variables (or use defaults):
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USERNAME=postgres
   export DB_PASSWORD=your_password
   export DB_DATABASE=birdguide
   ```

3. Run the script with the path to your JSON file:
   ```bash
   # For Spanish (Argentina)
   npm run populate:argentina /Users/gonzalogm/Downloads/argentina-es_AR.json
   
   # For English (US)
   npm run populate:argentina /Users/gonzalogm/Downloads/argentina-en_US.json
   ```

   Or run it directly:
   ```bash
   npx ts-node --transpile-only --experimental-specifier-resolution=node apps/api/src/scripts/populate-argentina-species.ts /Users/gonzalogm/Downloads/argentina-en_US.json
   ```

### What it does

- **Automatically detects language** from filename pattern: `argentina-{langCode}.json`
  - `argentina-es_AR.json` → Spanish (Argentina)
  - `argentina-en_US.json` → English (US)
  - Supports any `{lang}_{COUNTRY}` format

- Creates species entries in the `species` table with:
  - Scientific name
  - eBird ID (from the birdID field)
  - Basic taxonomy (genus extracted from scientific name)
  - Other fields set to NULL (family, order, IUCN status, etc.)

- Creates common name entries in the `species_common_name` table with:
  - Language code detected from filename
  - Common name from the JSON file
  - Marked as preferred for this language
  - Linked to the corresponding species

### Data Source

The script uses the following Argentina species data:
- Paloma Manchada (Patagioenas maculosa) - spwpig3
- Torcaza (Zenaida auriculata) - eardov1  
- Crespín (Tapera naevia) - strcuc1

### Notes

- The script checks for existing species by eBird ID to avoid duplicates
- If a species already exists, it will skip it and continue with the next one
- The script will log its progress and any errors encountered
