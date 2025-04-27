"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);

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
          onClick={() => setIsOpen(true)}
        >
          {/* Burger lines */}
          <div className="absolute top-2 left-0 w-10 h-1 bg-black transition-all duration-300"></div>
          <div className="absolute top-4 left-0 w-10 h-1 bg-black transition-all duration-300"></div>
          <div className="absolute top-6 left-0 w-10 h-1 bg-black transition-all duration-300"></div>
        </button>
      </nav>

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="text-3xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-4 p-6">
          <a
            href="#importance"
            className="w-full bg-black text-white py-4 text-center text-lg font-semibold rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            Важливість
          </a>
          <a
            href="#how-it-works"
            className="w-full bg-black text-white py-4 text-center text-lg font-semibold rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            Як працює
          </a>
          <a
            href="#what-to-enter"
            className="w-full bg-black text-white py-4 text-center text-lg font-semibold rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            Що вказувати
          </a>
          <a
            href="#for-whom"
            className="w-full bg-black text-white py-4 text-center text-lg font-semibold rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            Для кого
          </a>
        </div>
      </div>

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
