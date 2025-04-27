import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const scrollToForm = () => {
    const formSection = document.getElementById('form-intro-section');
    formSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="min-h-screen flex flex-col items-center px-6"
      style={{
        backgroundImage: "url('/gradient-back.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <nav className="w-full max-w-5xl flex justify-between items-center py-6 text-black mt-[50px] mb-[50px]">
        <div className="flex gap-8 text-md font-semibold">
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
        <div className="flex flex-col gap-6 px-4 md:px-0">
          <h1 className="text-4xl md:text-5xl font-bold">
            Віднови свою <span className="text-blue-600">землю</span> —<br />
            віднови свою <span className="text-blue-400">справедливість</span>
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

        <div className="flex justify-center">
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
