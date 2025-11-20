import { useState } from 'react';
import ErrorSection from '../UI/ErrorSection';
import { capitalize } from '../../util/functions';


function ProviderLogo({ provider }) {
  const { logo_path, provider_name } = provider;

  return (
    <div title={provider_name} className="flex flex-col items-center gap-1 group">
      <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md transition-transform group-hover:scale-110">
        <img src={logo_path} alt={provider_name} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs text-stone-50 text-center max-w-[60px] truncate">
        {provider_name}
      </span>
    </div>
  );
}


const ProviderSection = ({ title, providers }) => {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className='text-base font-semibold mb-2 text-white'>
        {title}
      </h4>
      <div className="flex flex-wrap gap-4">
        {providers.map(provider => (
          <ProviderLogo key={provider.provider_id} provider={provider} />
        ))}
      </div>
    </div>
  );
};


function ProvidersSummary({ providers }) {
  return (
    <div className="flex flex-wrap gap-4">
      {providers.map(provider => (
        <ProviderLogo key={provider.provider_id} provider={provider} />
      ))}
    </div>
  );
}


function ExpandedProviders({ providers }) {
  return (
    <div>
      {providers.map(([key, providersArray]) => (
        <ProviderSection
          key={key}
          title={(key === 'flatrate') ? "Streaming" : capitalize(key)}
          providers={providersArray}
        />
      ))}
    </div>
  );
}


function WatchProviders({ providers, summaryProviders, limit, expandedLength, margin }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMore = expandedLength > limit;

  return (
    <div className={`bg-slate-700 rounded-xl shadow-lg p-4 max-w-2xl ${margin}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-stone-50">
          Where to Watch
        </h3>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show All (${expandedLength})`}
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {!isExpanded ? <ProvidersSummary providers={summaryProviders} /> : <ExpandedProviders providers={providers} />}
    </div >
  );
};


// wrapper component so that the javascript logic doesn't re-execute for every state change (optimizing performance)
export default function WatchProvidersWrapper({ providers, margin }) {
  if (!providers || Object.keys(providers).length === 0) {
    return <ErrorSection message="No streaming information available" />
  }

  const MAX_SUMMARY_ITEMS = 4;
  const allProviders = Object.entries(providers).filter(([, value]) => Array.isArray(value));

  let mergedProviders = [];
  allProviders.forEach(([, value]) => mergedProviders = [...mergedProviders, ...value]);

  // remove duplicate providers (one provider can be in several categories)
  const uniqueKeys = new Set();
  mergedProviders = mergedProviders.filter(provider => {
    if (uniqueKeys.has(provider.provider_id)) return false;
    else {
      uniqueKeys.add(provider.provider_id);
      return true;
    }
  });

  const summaryProviders = mergedProviders
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, MAX_SUMMARY_ITEMS);

  
  return (
    <WatchProviders
      summaryProviders={summaryProviders}
      expandedLength={mergedProviders.length}
      limit={MAX_SUMMARY_ITEMS}
      providers={allProviders}
      margin={margin}
    />
  );
}