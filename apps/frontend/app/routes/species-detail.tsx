import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import type { SpeciesWithCommonName } from '@birdguide/shared-types';

export default function SpeciesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [species, setSpecies] = useState<SpeciesWithCommonName | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      if (!id) {
        setError('Species ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/species/${id}`
        );
        const data = await response.json();

        if (data.success) {
          setSpecies(data.data);
        } else {
          setError(data.message || 'Species not found');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading species details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Link to="/species" className="text-blue-600 hover:underline">
            ← Back to Species List
          </Link>
        </div>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Species not found</div>
          <Link to="/species" className="text-blue-600 hover:underline">
            ← Back to Species List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/species" className="text-blue-600 hover:underline">
          ← Back to Species List
        </Link>
      </div>

      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">
          {species.commonName || 'No common name'}
        </h1>
        <p className="text-2xl text-gray-600 italic mb-8">
          {species.scientificName}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Classification</h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Family:</dt>
                <dd className="text-gray-600">{species.family || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="font-medium">Genus:</dt>
                <dd className="text-gray-600">{species.genus || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="font-medium">Order:</dt>
                <dd className="text-gray-600">
                  {species.orderName || 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">IUCN Status:</dt>
                <dd className="text-gray-600">
                  {species.iucnStatus || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Size:</dt>
                <dd className="text-gray-600">
                  {species.sizeMm ? `${species.sizeMm}mm` : 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {species.summary && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700">{species.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
