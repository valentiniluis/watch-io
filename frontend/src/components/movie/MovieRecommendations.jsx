import MovieCard from "./MovieCard";


export default function MovieRecommendations({ movies }) {
  if (movies.length === 0) {
    return <h3 className="text-center text-xl font-medium">No Recommendations Available</h3>;
  }

  return (
    <section className='my-12'>
      <h3 className='section-title mb-6'>You May Like</h3>
      <div className='movie-list'>
        {movies.map(rec => <MovieCard key={rec.id} movie={rec} />)}
      </div>
    </section>
  )
}