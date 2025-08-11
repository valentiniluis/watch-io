import MovieCard from "./MovieCard";


export default function MovieRecommendations({ movies }) {
  if (movies.length === 0) {
    return <h3>No Recommendations Available</h3>;
  }

  return (
    <section className='my-12'>
      <h3 className='text-2xl mb-4'>You May Like</h3>
      <div className='recommendations'>
        {movies.map(rec => <MovieCard key={rec.id} movie={rec} />)}
      </div>
    </section>
  )
}