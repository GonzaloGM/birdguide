import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SpeciesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('footer.species')}
        </h1>
        <p className="text-gray-600">Species page content will go here.</p>
      </div>
    </div>
  );
}
