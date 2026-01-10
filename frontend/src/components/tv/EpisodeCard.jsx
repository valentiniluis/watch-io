
export default function EpisodeCard({ episode }) {

  const { episode_number, name, runtime, still_path, vote_average } = episode;

  return (
    <li className="p-2.5 max-w-sm w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:shadow-2xl">

      <div className="relative w-full overflow-hidden rounded-lg">
        <img
          src={still_path}
          alt={`Episode ${episode_number}: ${name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800x450?text=No+Image+Available";
          }}
        />
      </div>

      <div className="p-2 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-extrabold text-stone-100 leading-tight truncate">
            <span className="text-base tracking-wide mr-1.5">
              {episode_number}.
            </span>
            {name}
          </h3>
        </div>

        <div className="flex items-center gap-4 py-1">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-stone-200">{vote_average || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-stone-300">{runtime}</span>
          </div>
        </div>
      </div>
    </li>
  );
};
