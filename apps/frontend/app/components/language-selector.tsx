import { useLanguage } from '../contexts/language-context';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLanguage = event.target.value as 'es-AR' | 'en-US';
    changeLanguage(newLanguage);
  };

  return (
    <select
      value={language}
      onChange={handleLanguageChange}
      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      role="combobox"
    >
      <option value="es-AR">es-AR</option>
      <option value="en-US">en-US</option>
    </select>
  );
};

export default LanguageSelector;
