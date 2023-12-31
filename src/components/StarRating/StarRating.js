import React, { useState } from 'react';
import { Rating } from 'react-simple-star-rating';

function StarRating() {
  const [rating, setRating] = useState(0);

  // Catch Rating value
  const handleRating = (rate) => {
    setRating(rate);
console.log(rating)
    // other logic
  };

  // Optional callback functions
//   const onPointerEnter = () => console.log('Enter');
//   const onPointerLeave = () => console.log('Leave');
  const onPointerMove = (value, index) => console.log(value, index);

  return (
    <div className='star-rating'>
      <Rating
        onClick={handleRating}
        // onPointerEnter={onPointerEnter}
        // onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        /* Available Props */
      />
    </div>
  );
}

export default StarRating;