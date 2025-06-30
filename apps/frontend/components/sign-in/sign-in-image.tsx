"use client";

import Image from "next/image";
export default function SignInImage() {
  return (
    <>
      {/* Right side: Image (hidden on mobile) */}
      {/* Remplacer le img par un Image de next/image, dès qu'on met une image custom*/}
      <Image
        src="/sign-in-image-bg.png"
        alt="Image"
        width="1800"
        height="1800"
        className="w-1/2 rounded-xl object-cover md:block hidden"
      />
    </>
  );
}
