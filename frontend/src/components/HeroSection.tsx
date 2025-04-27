"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className="flex flex-col items-center px-6 pb-[100px]"
      style={{
        backgroundImage: "url('/gradient-back.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Navbar */}
      <nav className="w-full max-w-5xl flex justify-start items-center py-6 text-black mt-[50px] mb-[20px] relative">
        {/* Desktop Menu */}
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

        {/* Burger Icon (Mobile) */}
        <button
          className="md:hidden ml-auto relative w-10 h-10 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Animated Burger Lines */}
          <div
            className={`absolute top-2 left-0 w-10 h-1 bg-black transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-4" : ""
            }`}
          ></div>
          <div
            className={`absolute top-4 left-0 w-10 h-1 bg-black transition-opacity duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          ></div>
          <div
            className={`absolute top-6 left-0 w-10 h-1 bg-black transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-4" : ""
            }`}
          ></div>
        </button>
      </nav>

      {/* Mobile Menu: appears below navbar */}
      {isOpen && (
        <div className="w-full max-w-5xl flex flex-col bg-white rounded-lg shadow-md py-6 mb-10 md:hidden animate-slide-down">
          <a
            href="#importance"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 hover:bg-blue-100 font-semibold text-center"
          >
            Важливість
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 hover:bg-blue-100 font-semibold text-center"
          >
            Як працює
          </a>
          <a
            href="#what-to-enter"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 hover:bg-blue-100 font-semibold text-center"
          >
            Що вказувати
          </a>
          <a
            href="#for-whom"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 hover:bg-blue-100 font-semibold text-center"
          >
            Для кого
          </a>
        </div>
      )}

      {/* Hero Content */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-6 px-4 md:px-0">
          <h1 className="text-4xl md:text-5xl font-bold">
            Віднови свою <span className="text-blue-600">землю</span> —<br />
            віднови свою <span className="text-blue-600">справедливість</span>
          </h1>
          <p className="text-lg text-gray-700">
            Допомагаємо українським фермерам оцінити втрати від війни і подати
            юридичні вимоги на відшкодування
          </p>
          <Link href="/form">
            <button className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg shadow-md">
              Заповнити форму
            </button>
          </Link>
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
