import React from 'react';

const SingleTypeButton = ({ children, OnChick, className }) => {
  return (
    <button onClick={OnChick} className={"p-2 rounded-2xl bg-white border border-token-border-medium hover:bg-[#dbdbdb88] active:scale-90 "+className}>
      {children}
    </button>
  );
};

export default SingleTypeButton;
