"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToForm = () => {
    const formSection = document.getElementById("form-intro-section");
    if (formSection) {
      formSection.scrollIntoView({
        behavior: "smooth",
        block: window.innerWidth < 768 ? "start" : "center",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <section
      className="flex flex-col items-center px-6 pb-[100px] relative overflow-x-hidden"
      style={{
        backgroundImage: "url('/gradient-back.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <nav className="w-full max-w-6xl flex justify-start items-center py-6 text-black mt-[30px] mb-[50px] relative">
        <div className="hidden md:flex gap-8 text-md font-semibold">
          <a href="#importance" className="hover:text-blue-600">
            Важливість
          </a>
          <a href="#how-it-works" className="hover:text-blue-600">
            Як працює
          </a>
          <a href="#what-to-enter" className="hover:text-blue-600">
            Що вказувати
          </a>
          <a href="#for-whom" className="hover:text-blue-600">
            Для кого
          </a>
        </div>

        {/* Burger Button (Mobile) */}
        <button
          className="md:hidden ml-auto relative w-10 h-10 z-50 flex flex-col justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* 3 lines animated */}
          <span
            className={`block h-1 w-10 bg-black transform transition-all duration-300 ease-in-out ${
              isOpen ? "rotate-45 translate-y-3" : ""
            }`}
          />
          <span
            className={`block h-1 w-10 bg-black transition-all duration-300 ease-in-out ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-1 w-10 bg-black transform transition-all duration-300 ease-in-out ${
              isOpen ? "-rotate-45 -translate-y-6" : ""
            }`}
          />
        </button>
      </nav>

      <div
        className={`fixed top-0 right-0 h-full w-[100%] bg-white z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } border-t border-b border-black`}
      >
        {/* Menu Items */}
        <div className="flex flex-col gap-4 p-6 mt-[150px]">
          <a
            href="#importance"
            className="w-full text-black py-4 text-center text-lg font-semibold border-t border-b border-black"
            onClick={() => setIsOpen(false)}
          >
            Важливість
          </a>
          <a
            href="#how-it-works"
            className="w-full text-black py-4 text-center text-lg font-semibold border-t border-b border-black"
            onClick={() => setIsOpen(false)}
          >
            Як працює
          </a>
          <a
            href="#what-to-enter"
            className="w-full text-black py-4 text-center text-lg font-semibold border-t border-b border-black"
            onClick={() => setIsOpen(false)}
          >
            Що вказувати
          </a>
          <a
            href="#for-whom"
            className="w-full text-black py-4 text-center text-lg font-semibold border-t border-b border-black"
            onClick={() => setIsOpen(false)}
          >
            Для кого
          </a>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-6 px-4 md:px-0">
          <h1 className="text-3xl md:text-5xl font-bold break-words leading-tight">
            Віднови свою <span className="text-blue-600">землю</span> — віднови
            свою <span className="text-blue-600">справедливість</span>
          </h1>
          <p className="text-lg text-gray-700">
            Допомагаємо українським фермерам оцінити втрати від війни і подати
            юридичні вимоги на відшкодування
          </p>
          <button
            onClick={scrollToForm}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg shadow-md"
          >
            Заповнити форму
          </button>
        </div>

        <div className="hidden md:flex justify-center">
          <Image
            src="/plant-image.png"
            alt="Plant growing"
            width={300}
            height={300}
            className="opacity-70"
          />
        </div>
      </div>
    </section>
  );
}
