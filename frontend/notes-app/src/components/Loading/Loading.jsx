/** @format */

import React from "react";
import { MutatingDots } from "react-loader-spinner";

const Loading = ({message}) => {

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 backdrop-blur-[5px] bg-black/50">
      <MutatingDots
        visible={true}
        height={100}
        width={100}
        color="white"
        secondaryColor="white"
        radius={12.5}
        ariaLabel="mutating-dots-loading"
        wrapperClass=""
        wrapperStyle={{ zIndex: 50 }}
      />
      <h2 className="test-[24px] text-white font-700 mt-[20px]">{message}</h2>
    </div>
  );
};

export default Loading;
