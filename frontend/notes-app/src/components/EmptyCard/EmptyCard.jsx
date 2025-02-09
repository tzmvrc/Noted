/** @format */

import React from "react";

const EmptyCard = ({ imgSrc, message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-25">
      <img src={imgSrc} alt="No notes" className="w-60 h-auto" />

      <p className="w-1/2 text-[14px] font-medium text-slate-700 text-center leading-7 mt-5">
        {message}
      </p>
    </div>
  );
};

export default EmptyCard;
