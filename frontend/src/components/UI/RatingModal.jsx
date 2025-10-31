import Input from "./Input";


export default function RatingModal({ handleSubmit }) {
  return (
    <dialog>
      <form action={handleSubmit} className='flex flex-col'>
        <h4 className="regular-text">Rate this movie!</h4>
        <Input id='headline' name='headline' label="Rating Headline" required />
        <Input type="textarea" id="description" name="description" label="Description" />
        {/* <textarea className="border border-stone-400 rounded-md px-4 py-1.5" name="description" id="description"></textarea> */}
        <button className='px-4 py-2 border border-stone-500 text-stone-300 rounded-sm hover:border-stone-300 hover:text-stone-100 my-2'>Add Rating</button>
      </form>
    </dialog>
  );
}