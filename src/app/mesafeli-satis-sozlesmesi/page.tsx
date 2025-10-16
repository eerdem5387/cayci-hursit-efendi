export const metadata = {
  title: "Mesafeli Satış Sözleşmesi - Çaycı Hurşit Efendi",
  description: "Çaycı Hurşit Efendi mesafeli satış sözleşmesi ve tüketici hakları."
};

export default function DistanceSalesContract() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Mesafeli Satış Sözleşmesi</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">1. Taraflar</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              <strong>Satıcı:</strong> Çaycı Hurşit Efendi<br/>
              <strong>Adres:</strong> İstanbul, Türkiye<br/>
              <strong>Telefon:</strong> +90 (212) 123 45 67<br/>
              <strong>E-posta:</strong> info@caycihursitefendi.com
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            <strong>Alıcı:</strong> Web sitemizden sipariş veren müşteri
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">2. Konu</h2>
          <p className="text-gray-700 leading-relaxed">
            Bu sözleşme, satıcının web sitesi üzerinden sunulan çay ve kahve ürünlerinin 
            mesafeli satışı ile ilgilidir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">3. Sipariş Süreci</h2>
          <ol className="list-decimal pl-6 text-gray-700 leading-relaxed">
            <li>Müşteri web sitesinde ürünleri inceleyerek sepetine ekler</li>
            <li>Ödeme sayfasında gerekli bilgileri doldurur</li>
            <li>Sipariş onayı verilir</li>
            <li>Ödeme işlemi gerçekleştirilir</li>
            <li>Sipariş işleme alınır ve kargo süreci başlar</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">4. Fiyat ve Ödeme</h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Tüm fiyatlar Türk Lirası (₺) cinsindendir</li>
            <li>Fiyatlara KDV dahildir</li>
            <li>Kargo ücreti ücretsizdir</li>
            <li>Ödeme kredi kartı ile güvenli şekilde alınır</li>
            <li>Ödeme işlemi SSL şifreleme ile korunur</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">5. Teslimat</h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Teslimat süresi 1-3 iş günüdür</li>
            <li>Teslimat adresi sipariş sırasında belirtilen adrestir</li>
            <li>Teslimat sırasında kimlik kontrolü yapılabilir</li>
            <li>Ürün teslim alınmazsa, kargo firmasına iade edilir</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">6. İade ve Değişim</h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>İade süresi teslim tarihinden itibaren 14 gündür</li>
            <li>Ürün orijinal ambalajında ve kullanılmamış olmalıdır</li>
            <li>İade talepleri müşteri hizmetleri ile iletişime geçilerek yapılır</li>
            <li>İade kargo ücreti müşteriye aittir</li>
            <li>İade onaylandıktan sonra ödeme 5-7 iş günü içinde iade edilir</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">7. Sorumluluklar</h2>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Satıcının Sorumlulukları:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
            <li>Ürünleri zamanında ve sağlam şekilde teslim etmek</li>
            <li>Müşteri bilgilerini gizli tutmak</li>
            <li>Yasal yükümlülükleri yerine getirmek</li>
          </ul>
          
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Alıcının Sorumlulukları:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Doğru ve güncel bilgiler vermek</li>
            <li>Ödeme yükümlülüğünü yerine getirmek</li>
            <li>Teslimat sırasında ürünü kontrol etmek</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">8. Garanti</h2>
          <p className="text-gray-700 leading-relaxed">
            Tüm ürünlerimiz orijinal ve kaliteli ürünlerdir. Üretim tarihi ve son kullanma tarihi 
            bilgileri ürün ambalajında yer almaktadır.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">9. Uyuşmazlık Çözümü</h2>
          <p className="text-gray-700 leading-relaxed">
            Bu sözleşmeden doğabilecek uyuşmazlıklar öncelikle dostane yollarla çözülmeye çalışılır. 
            Çözülemeyen durumlarda İstanbul Mahkemeleri yetkilidir.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">10. İletişim</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Müşteri Hizmetleri:</strong><br/>
              <strong>E-posta:</strong> info@caycihursitefendi.com<br/>
              <strong>Telefon:</strong> +90 (212) 123 45 67<br/>
              <strong>Çalışma Saatleri:</strong> Pazartesi - Cuma, 09:00 - 18:00
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">11. Yürürlük</h2>
          <p className="text-gray-700 leading-relaxed">
            Bu sözleşme sipariş verildiği tarihte yürürlüğe girer. Sözleşme şartları 
            önceden haber verilmeksizin değiştirilebilir.
          </p>
        </section>
      </div>
    </div>
  );
}