
export default function ErrorPage({ message }) {
  return (
    <section className="text-center mt-[32vh]">
      <h2 className="font-semibold text-4xl">Sorry!</h2>
      <h3 className="text-xl mt-8">{message || 'An Error Occurred.'}</h3>
    </section>
  );
}