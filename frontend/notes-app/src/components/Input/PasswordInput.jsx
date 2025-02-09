import React, { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false); 

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className='flex items-center bg-transparent border-[1.5px] rounded mb-[10px]'>
      <input
        value={value}
        onChange={onChange} 
        type={isShowPassword ? 'text' : 'password'}
        placeholder={placeholder || 'Password'}
        className='w-full text-sm bg-transparent py-3 px-4 rounded outline-none'
      />

      {isShowPassword ? (
        <FaRegEyeSlash
          size={22}
          className='text-violet-600 mr-[10px] cursor-pointer'
          onClick={toggleShowPassword} 
        />
      ) : (
        <FaRegEye
          size={22}
          className='text-violet-600 mr-[10px] cursor-pointer'
          onClick={toggleShowPassword}
        />
      )}
    </div>
  );
};

export default PasswordInput;
