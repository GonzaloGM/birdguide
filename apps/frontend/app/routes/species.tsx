import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { SpeciesWithCommonName } from '@birdguide/shared-types';

export default function SpeciesPage() {
  const [species, setSpecies] = useState<SpeciesWithCommonName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/species`
        );
        const data = await response.json();

        if (data.success) {
          setSpecies(data.data);
        } else {
          setError(data.message || 'Failed to fetch species');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading species...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bird Species</h1>

      <div className="grid gap-4">
        {species.map((specie) => (
          <Link
            key={specie.id}
            to={`/species/${specie.id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {specie.commonName || 'No common name'}
                </h2>
                <p className="text-gray-600 italic">{specie.scientificName}</p>
              </div>
              <div className="text-sm text-gray-500">{specie.family}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
