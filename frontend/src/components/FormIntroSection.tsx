import Link from "next/link";

export default function FormIntroSection() {
  return (
    <section
      className="flex items-center justify-center px-6 py-[100px]"
      style={{
        backgroundImage: "linear-gradient(to right, white 40%, #3b82f6 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-10">
            Форма фіксації втрат фермерського господарства
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="border border-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                1
              </div>
              <p className="text-lg">Введіть дані про втрати вручну у форму.</p>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="border border-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                2
              </div>
              <p className="text-lg">Перевірте заповнені дані на екрані.</p>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="border border-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                3
              </div>
              <p className="text-lg">Натисніть кнопку "Згенерувати документ"</p>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4">
              <div className="border border-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                4
              </div>
              <p className="text-lg">Завантажте готовий офіційний PDF.</p>
            </div>
          </div>

          <Link href="/form">
            <button className="mt-12 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg shadow-md">
              Заповнити форму
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
