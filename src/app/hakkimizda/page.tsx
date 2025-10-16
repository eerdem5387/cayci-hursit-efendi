"use client";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function AboutPage() {
  return (
    <motion.div
      className="mx-auto max-w-7xl px-4 py-10 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="grid items-start gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl">
          <img src="/cay-banner.jpg" alt="Çay tarlası" className="w-full h-auto object-contain" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-emerald-900 md:text-6xl">Bir Aileden Binlerce Sofraya</h1>
          <div className="mt-6 space-y-5 text-gray-800">
            <p><strong>Sakaoğlu Çay</strong>, 1994 yılında bir aile şirketi olarak Rize’de kurulmuştur. Kuruluşundan bu yana, kalite ve dürüstlükten ödün vermeden büyüyen firmamız, bugün sektörde söz sahibi bir marka haline gelmiştir. Rize’nin seçkin çay bahçelerinden özenle toplanan taze çay filizlerini işleyerek sofralarınıza ulaştırıyor; doğallığı ve lezzeti bir arada sunuyoruz.</p>
            <p>Fabrikamız Rize’dedir; hem bölgenin çay ihtiyacını karşılamakta hem de farklı bölgelere yüksek kalite standartlarıyla üretim yapmaktayız. 2000’li yıllardan itibaren Ankara, Nevşehir, Bolu gibi birçok şehirde gerçekleştirdiğimiz çalışmalarla markamızın bilinirliğini artırarak Türkiye çapında güçlü bir müşteri ağı oluşturduk.</p>
            <p>Bugün cafe, restoran, pastane, kıraathane, çay ocakları, otel ve tekstil firmaları gibi çeşitli işletmelere; insan sağlığına duyarlı, kalite odaklı hizmet sunmaya devam ediyoruz.</p>
          </div>
          <h2 className="mt-10 text-3xl font-extrabold text-emerald-900">Yeni Markamız: Çaycı Hurşit Efendi</h2>
          <div className="mt-4 space-y-5 text-gray-800">
            <p>Yıllar içerisinde edindiğimiz bilgi birikimi, üretim tecrübesi ve tüketici geri bildirimleri sonucunda, çay severler için yepyeni bir marka daha hayata geçirdik: <strong>Çaycı Hurşit Efendi</strong>.</p>
            <p>Reçetesi 1.5 yıl süren titiz bir çalışmanın sonucu olan <strong>Çaycı Hurşit Efendi</strong>, Sri Lanka ve Çin gibi çay üretiminde önemli yere sahip ülkelerde yapılan özel araştırmalar ile geliştirilmiş özel formül blendler içerir.</p>
            <p>Gelenekten ilham alan bu özel marka, Rize’nin eşsiz doğasından gelen çayların en rafine haliyle buluştuğu bir lezzet yolculuğudur. 100% tarım onaylı olan Çaycı Hurşit Efendi, Sakaoğlu Çay’ın yıllar süren deneyimi ve kalite anlayışının bir yansıması olarak, kusursuz bir şekilde sizlerin beğenisine sunulmuştur.</p>
          </div>
        </div>
      </motion.div>
      {/* features */}
      <motion.section variants={itemVariants} className="mt-16 rounded-3xl bg-[#F5F6F5] px-4 py-10 md:px-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 text-center md:grid-cols-3">
          <div className="space-y-3">
            <div className="mx-auto h-14 w-14">
              <img src="/hakkimizda.svg" alt="Kalite" className="h-full w-full object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-900">Kalite</h3>
            <p className="text-gray-600">Üretimin her aşamasında yüksek kalite standartlarını benimseyerek, hiçbir koşulda kaliteden ödün vermemek.</p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto h-14 w-14">
              <img src="/hakkimizda-2.svg" alt="Müşteri Memnuniyeti" className="h-full w-full object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-900">Müşteri Memnuniyeti</h3>
            <p className="text-gray-600">Müşterilerimizin ihtiyaçlarını ön planda tutarak, beklentilerin ötesinde hizmet sunmak.</p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto h-14 w-14">
              <img src="/hakkimizda3.svg" alt="Yerli Üretim" className="h-full w-full object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-900">Yerli Üretim</h3>
            <p className="text-gray-600">Tamamen yerli sermaye ile üretim yaparak, ülke ekonomisine katkı sağlamak ve milli değerleri desteklemek.</p>
          </div>
        </div>
      </motion.section>

      {/* mission & vision */}
      <motion.section variants={itemVariants} className="mx-auto mt-16 max-w-7xl px-0 md:px-0">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Mission */}
          <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: '695 / 853' }}>
            <img src="/about-bg-2.jpg" alt="Misyon görseli" className="absolute inset-0 h-full w-full object-cover grayscale" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute left-6 right-6 bottom-6 rounded-2xl bg-white p-6 shadow-lg md:left-10 md:right-auto md:bottom-10 md:max-w-[520px] md:p-10">
              <h3 className="text-3xl font-extrabold text-emerald-900">Misyonumuz</h3>
              <p className="mt-4 text-gray-700">Tamamen yerli sermaye ile kurulmuş bir aile şirketi olarak, kaliteli üretim anlayışımızdan taviz vermeden; müşteri memnuniyetini ilke edinmiş, doğaya ve insan sağlığına duyarlı bir marka olmak. Türkiye’nin her köşesine ulaşarak, geleneksel çay kültürünü en iyi şekilde temsil etmek.</p>
            </div>
          </div>

          {/* Vision */}
          <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: '695 / 853' }}>
            <img src="/about-bg-3.jpg" alt="Vizyon görseli" className="absolute inset-0 h-full w-full object-cover grayscale" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute left-6 right-6 bottom-6 rounded-2xl bg-white p-6 shadow-lg md:left-10 md:right-auto md:bottom-10 md:max-w-[520px] md:p-10">
              <h3 className="text-3xl font-extrabold text-emerald-900">Vizyonumuz</h3>
              <p className="mt-4 text-gray-700">Sakaoğlu Çay, tüm çalışanlarının özverili katkısıyla sürekli gelişen, Türkiye’nin dört bir yanında aktif rol almayı hedefleyen bir yapıya sahiptir. Karadeniz bölgesindeki güçlü varlığını sürdürerek, ulaşım ağlarının da gelişimiyle birlikte tüm Türkiye’de her eve ulaşmak vizyonumuzun temelini oluşturmaktadır.</p>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}


