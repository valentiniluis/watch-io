export default function ErrorSection({ message }) {
  return (
    <section className="text-center py-4">
      <h3 className="text-stone-200 text-xl font-semibold py-1">Oops!</h3>
      <p className="text-stone-400 text-lg font-medium">{message}</p>
    </section>
  )
}