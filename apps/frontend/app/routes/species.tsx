import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '../components/protected-route';
import { useLanguage } from '../contexts/language-context';
import { SpeciesService } from '../services/species.service';
import type { SpeciesWithCommonName } from '@birdguide/shared-types';

export default function SpeciesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [species, setSpecies] = useState<SpeciesWithCommonName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const speciesService = new SpeciesService();

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setLoading(true);
        const speciesData = await speciesService.getSpecies(language);

        // Sort species by common name alphabetically
        const sortedSpecies = speciesData.sort(
          (a: SpeciesWithCommonName, b: SpeciesWithCommonName) => {
            const nameA = a.commonName || '';
            const nameB = b.commonName || '';
            return nameA.localeCompare(nameB);
          }
        );
        setSpecies(sortedSpecies);
      } catch (err) {
        // Handle different types of errors appropriately
        if (err instanceof Error) {
          // Check if it's a network error or API error
          if (
            err.message.includes('Network error occurred') ||
            err.message === 'Network error'
          ) {
            setError(t('species.networkError'));
          } else {
            // API error with specific message
            setError(err.message);
          }
        } else {
          setError(t('species.networkError'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, [language]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">{t('species.loading')}</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-600">
            {t('species.error')}: {error}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('species.title')}</h1>

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
                    {specie.commonName || t('species.noCommonName')}
                  </h2>
                  <p className="text-gray-600 italic">
                    {specie.scientificName}
                  </p>
                </div>
                <div className="text-sm text-gray-500">{specie.family}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
