export const metadata = {
  title: "İade ve İptal Koşulları - Çaycı Hurşit Efendi",
  description: "Çaycı Hurşit Efendi iade ve iptal koşulları, tüketici hakları ve iade süreci."
};

export default function ReturnCancellationTerms() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">İade ve İptal Koşulları</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">1. Genel Hükümler</h2>
          <p className="text-gray-700 leading-relaxed">
            Bu iade ve iptal koşulları, Çaycı Hurşit Efendi web sitesi üzerinden yapılan tüm alışverişlerde 
            geçerlidir. Tüketici hakları ve mesafeli satış mevzuatı çerçevesinde düzenlenmiştir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">2. İade Hakkı</h2>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700 leading-relaxed font-semibold">
              <strong>İade Süresi:</strong> Teslim tarihinden itibaren 14 gün
            </p>
          </div>
          
          <h3 className="mb-2 text-lg font-semibold text-gray-800">İade Koşulları:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Ürün orijinal ambalajında olmalıdır</li>
            <li>Ürün kullanılmamış ve hasarsız olmalıdır</li>
            <li>Ürün etiketleri ve faturaları mevcut olmalıdır</li>
            <li>Gıda ürünlerinde son kullanma tarihi geçmemiş olmalıdır</li>
            <li>Kişisel hijyen ürünleri iade edilemez</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">3. İade Süreci</h2>
          <ol className="list-decimal pl-6 text-gray-700 leading-relaxed">
            <li><strong>İade Talebi:</strong> Müşteri hizmetleri ile iletişime geçin</li>
            <li><strong>İade Onayı:</strong> Talebiniz değerlendirilir ve onaylanır</li>
            <li><strong>Kargo:</strong> Ürünü orijinal ambalajında kargo ile gönderin</li>
            <li><strong>Kontrol:</strong> Ürün kontrol edilir ve uygunluk değerlendirilir</li>
            <li><strong>İade:</strong> Onay durumunda ödeme iade edilir</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">4. İade Kargo Ücreti</h2>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
              <li><strong>Ücretsiz Kargo:</strong> Ürün hatası veya yanlış gönderim durumunda</li>
              <li><strong>Müşteri Sorumluluğu:</strong> Müşteri kaynaklı iadelerde kargo ücreti müşteriye aittir</li>
              <li><strong>Kargo Takibi:</strong> İade kargo takip numarası verilir</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">5. İptal Koşulları</h2>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Sipariş İptali:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
            <li>Sipariş henüz işleme alınmamışsa ücretsiz iptal</li>
            <li>Kargo sürecine girmişse kargo durdurulur</li>
            <li>İptal talepleri 24 saat içinde değerlendirilir</li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-gray-800">İptal Edilemeyen Durumlar:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Özel sipariş ürünleri</li>
            <li>Kişiselleştirilmiş ürünler</li>
            <li>Hızlı bozulabilir gıda ürünleri</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">6. Ödeme İadesi</h2>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">İade Yöntemleri:</h3>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
              <li><strong>Kredi Kartı:</strong> 5-7 iş günü içinde hesaba iade</li>
              <li><strong>Banka Havalesi:</strong> 3-5 iş günü içinde hesaba iade</li>
              <li><strong>Nakit Ödeme:</strong> Aynı gün iade (mağaza ödemeleri)</li>
            </ul>
            
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Not:</strong> İade süresi banka işlem sürelerine bağlıdır.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">7. Değişim Koşulları</h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Değişim süresi teslim tarihinden itibaren 14 gündür</li>
            <li>Aynı ürün farklı varyantı ile değişim yapılabilir</li>
            <li>Fiyat farkı varsa ek ödeme veya iade yapılır</li>
            <li>Değişim kargo ücreti ücretsizdir</li>
            <li>Stokta bulunmayan ürünler için iade yapılır</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">8. Özel Durumlar</h2>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Gıda Ürünleri:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
            <li>Son kullanma tarihi geçmiş ürünler iade edilir</li>
            <li>Ambalajı açılmış gıda ürünleri iade edilemez</li>
            <li>Soğuk zincir kırılmış ürünler iade edilir</li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-gray-800">Hediyelik Ürünler:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Kişiselleştirilmiş hediyelik ürünler iade edilemez</li>
            <li>Özel ambalajlı ürünler orijinal ambalajında iade edilir</li>
            <li>Hediye notu ile gönderilen ürünler iade edilebilir</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">9. Müşteri Hizmetleri</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed mb-4">
              İade ve iptal işlemleri için aşağıdaki kanallardan bizimle iletişime geçebilirsiniz:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
              <li><strong>E-posta:</strong> iade@caycihursitefendi.com</li>
              <li><strong>Telefon:</strong> +90 (212) 123 45 67</li>
              <li><strong>WhatsApp:</strong> +90 (212) 123 45 67</li>
              <li><strong>Çalışma Saatleri:</strong> Pazartesi - Cuma, 09:00 - 18:00</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">10. Yasal Haklar</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Bu koşullar, aşağıdaki yasal düzenlemeler çerçevesinde hazırlanmıştır:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>6502 sayılı Tüketicinin Korunması Hakkında Kanun</li>
            <li>Mesafeli Sözleşmeler Yönetmeliği</li>
            <li>Ticaret Kanunu</li>
            <li>Borçlar Kanunu</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">11. Uyuşmazlık Çözümü</h2>
          <p className="text-gray-700 leading-relaxed">
            İade ve iptal konularında yaşanan uyuşmazlıklar öncelikle dostane yollarla çözülmeye çalışılır. 
            Çözülemeyen durumlarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">12. Değişiklikler</h2>
          <p className="text-gray-700 leading-relaxed">
            Bu iade ve iptal koşulları gerektiğinde güncellenebilir. Önemli değişiklikler web sitemizde 
            duyurulacak ve mevcut müşterilere e-posta ile bildirilecektir.
          </p>
        </section>
      </div>
    </div>
  );
}