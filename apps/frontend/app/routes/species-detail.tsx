import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/language-context';
import { SpeciesService } from '../services/species.service';
import type { SpeciesWithCommonName } from '@birdguide/shared-types';

export default function SpeciesDetailPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [species, setSpecies] = useState<SpeciesWithCommonName | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const speciesService = new SpeciesService();

  useEffect(() => {
    const fetchSpecies = async () => {
      if (!id) {
        setError(t('species.speciesIdRequired'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const speciesData = await speciesService.getSpeciesDetail(parseInt(id, 10), language);
        setSpecies(speciesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('species.networkError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, [id, language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">{t('species.loadingDetails')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            {t('species.error')}: {error}
          </div>
          <Link to="/species" className="text-blue-600 hover:underline">
            {t('species.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">
            {t('species.speciesNotFound')}
          </div>
          <Link to="/species" className="text-blue-600 hover:underline">
            {t('species.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/species" className="text-blue-600 hover:underline">
          {t('species.backToList')}
        </Link>
      </div>

      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">
          {species.commonName || t('species.noCommonName')}
        </h1>
        <p className="text-2xl text-gray-600 italic mb-8">
          {species.scientificName}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t('species.classification')}
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">{t('species.family')}</dt>
                <dd className="text-gray-600">
                  {species.family || t('species.notAvailable')}
                </dd>
              </div>
              <div>
                <dt className="font-medium">{t('species.genus')}</dt>
                <dd className="text-gray-600">
                  {species.genus || t('species.notAvailable')}
                </dd>
              </div>
              <div>
                <dt className="font-medium">{t('species.order')}</dt>
                <dd className="text-gray-600">
                  {species.orderName || t('species.notAvailable')}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t('species.details')}
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">{t('species.iucnStatus')}</dt>
                <dd className="text-gray-600">
                  {species.iucnStatus || t('species.notAvailable')}
                </dd>
              </div>
              <div>
                <dt className="font-medium">{t('species.size')}</dt>
                <dd className="text-gray-600">
                  {species.sizeMm
                    ? `${species.sizeMm}mm`
                    : t('species.notAvailable')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {species.summary && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              {t('species.description')}
            </h2>
            <p className="text-gray-700">{species.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
