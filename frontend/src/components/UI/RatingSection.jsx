import { useState } from "react";


export default function RatingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className='flex justify-center'>
      <button className='regular-text px-6 py-2 rounded-md bg-amber-600 hover:bg-amber-700 hover:text-stone-100'>Rate this movie!</button>
    </div>
  );
}