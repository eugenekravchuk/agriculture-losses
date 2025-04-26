import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 px-6">
      <nav className="w-full max-w-5xl flex justify-between items-center py-6">
        <div className="flex gap-8 text-sm font-semibold">
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
      </nav>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-bold">
            Віднови свою <span className="text-blue-600">землю</span> —<br />
            віднови свою <span className="text-blue-400">справедливість</span>
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

        <div className="flex justify-center">
          <Image
            src="/plant-image.png"
            alt="Plant growing"
            width={250}
            height={250}
            className="opacity-70"
          />
        </div>
      </div>
    </section>
  );
}
