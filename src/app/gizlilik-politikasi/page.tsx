export const metadata = {
  title: "Gizlilik Politikası - Çaycı Hurşit Efendi",
  description: "Çaycı Hurşit Efendi gizlilik politikası ve kişisel verilerin korunması hakkında bilgiler."
};

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">1. Giriş</h2>
          <p className="text-gray-700 leading-relaxed">
            Çaycı Hurşit Efendi olarak, kişisel verilerinizin güvenliği bizim için önemlidir. Bu gizlilik politikası, 
            web sitemizi kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">2. Toplanan Bilgiler</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Sipariş verme sürecinde aşağıdaki bilgileri toplarız:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Ad ve soyad</li>
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>Adres bilgileri</li>
            <li>Ödeme bilgileri (güvenli şekilde işlenir)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">3. Bilgilerin Kullanımı</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Siparişlerinizi işlemek ve teslim etmek</li>
            <li>Müşteri hizmetleri sağlamak</li>
            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            <li>Ürün ve hizmetlerimizi geliştirmek</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">4. Bilgi Paylaşımı</h2>
          <p className="text-gray-700 leading-relaxed">
            Kişisel bilgilerinizi üçüncü taraflarla paylaşmayız. Sadece yasal zorunluluklar veya mahkeme kararları 
            durumunda bilgi paylaşımı yapılabilir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">5. Veri Güvenliği</h2>
          <p className="text-gray-700 leading-relaxed">
            Kişisel verilerinizi korumak için uygun teknik ve idari önlemler alırız. Ödeme bilgileriniz 
            SSL şifreleme ile korunur ve güvenli ödeme sistemleri kullanılır.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">6. Çerezler (Cookies)</h2>
          <p className="text-gray-700 leading-relaxed">
            Web sitemizde kullanıcı deneyimini geliştirmek için çerezler kullanılır. Çerezleri tarayıcı 
            ayarlarınızdan yönetebilirsiniz.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">7. Haklarınız</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            KVKK kapsamında aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
            <li>Kişisel verilerinizin silinmesini veya yok edilmesini talep etme</li>
            <li>İşlenen verilerin üçüncü kişilere aktarılması halinde bu konuda bilgilendirilme</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">8. İletişim</h2>
          <p className="text-gray-700 leading-relaxed">
            Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">
              <strong>E-posta:</strong> info@caycihursitefendi.com<br/>
              <strong>Telefon:</strong> +90 (212) 123 45 67<br/>
              <strong>Adres:</strong> İstanbul, Türkiye
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">9. Değişiklikler</h2>
          <p className="text-gray-700 leading-relaxed">
            Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler web sitemizde 
            duyurulacaktır.
          </p>
        </section>
      </div>
    </div>
  );
}