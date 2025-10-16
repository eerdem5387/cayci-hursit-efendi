export const metadata = {
  title: "KVKK Aydınlatma Metni - Çaycı Hurşit Efendi",
  description: "Çaycı Hurşit Efendi KVKK aydınlatma metni ve kişisel verilerin işlenmesi hakkında bilgiler."
};

export default function KVKKDisclosure() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">KVKK Aydınlatma Metni</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">1. Veri Sorumlusu</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              <strong>Veri Sorumlusu:</strong> Çaycı Hurşit Efendi<br/>
              <strong>Adres:</strong> İstanbul, Türkiye<br/>
              <strong>Telefon:</strong> +90 (212) 123 45 67<br/>
              <strong>E-posta:</strong> info@caycihursitefendi.com
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">2. İşlenen Kişisel Veriler</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Aşağıdaki kişisel verilerinizi işlemekteyiz:
          </p>
          
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Kimlik Verileri:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
            <li>Ad ve soyad</li>
            <li>TC kimlik numarası (yasal zorunluluk durumunda)</li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-gray-800">İletişim Verileri:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>Adres bilgileri</li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-gray-800">Müşteri İşlem Verileri:</h3>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Sipariş geçmişi</li>
            <li>Ödeme bilgileri</li>
            <li>İletişim geçmişi</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Siparişlerin işlenmesi ve teslim edilmesi</li>
            <li>Müşteri hizmetleri sağlanması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Ürün ve hizmet kalitesinin artırılması</li>
            <li>Pazarlama faaliyetlerinin yürütülmesi</li>
            <li>Müşteri memnuniyetinin ölçülmesi</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li><strong>KVKK md. 5/2-a:</strong> Açık rıza</li>
            <li><strong>KVKK md. 5/2-c:</strong> Sözleşmenin kurulması veya ifası</li>
            <li><strong>KVKK md. 5/2-f:</strong> Meşru menfaat</li>
            <li><strong>KVKK md. 5/2-ç:</strong> Yasal yükümlülüğün yerine getirilmesi</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">5. Kişisel Verilerin Saklanma Süreleri</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
              <li><strong>Sipariş verileri:</strong> 10 yıl (muhasebe mevzuatı gereği)</li>
              <li><strong>İletişim verileri:</strong> 3 yıl</li>
              <li><strong>Pazarlama verileri:</strong> Rıza geri alınana kadar</li>
              <li><strong>Çerez verileri:</strong> 2 yıl</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">6. Kişisel Verilerin Paylaşılması</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Kişisel verileriniz aşağıdaki durumlarda paylaşılabilir:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Kargo firmaları (teslimat için)</li>
            <li>Ödeme işlemcileri (güvenli ödeme için)</li>
            <li>Yasal merciler (yasal zorunluluk durumunda)</li>
            <li>Hizmet sağlayıcılar (teknik altyapı için)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">7. Veri Güvenliği</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Kişisel verilerinizi korumak için aşağıdaki önlemleri almaktayız:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>SSL şifreleme teknolojisi</li>
            <li>Güvenli sunucu altyapısı</li>
            <li>Düzenli güvenlik güncellemeleri</li>
            <li>Erişim kontrolü ve yetkilendirme</li>
            <li>Veri yedekleme sistemleri</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">8. Veri Sahibinin Hakları</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            KVKK md. 11 uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme, silme ve yok edilme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">9. Başvuru Yöntemleri</h2>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
            </p>
            <ul className="list-disc pl-6 text-gray-700 leading-relaxed mt-2">
              <li><strong>E-posta:</strong> kvkk@caycihursitefendi.com</li>
              <li><strong>Posta:</strong> İstanbul, Türkiye (yazılı başvuru)</li>
              <li><strong>Web sitesi:</strong> İletişim formu üzerinden</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              <strong>Not:</strong> Başvurularınız 30 gün içinde yanıtlanacaktır.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">10. Çerezler (Cookies)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Web sitemizde aşağıdaki çerez türleri kullanılmaktadır:
          </p>
          <ul className="list-disc pl-6 text-gray-700 leading-relaxed">
            <li><strong>Zorunlu Çerezler:</strong> Site işlevselliği için gerekli</li>
            <li><strong>Analitik Çerezler:</strong> Site kullanım istatistikleri</li>
            <li><strong>Pazarlama Çerezleri:</strong> Kişiselleştirilmiş içerik</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">11. Değişiklikler</h2>
          <p className="text-gray-700 leading-relaxed">
            Bu aydınlatma metni gerektiğinde güncellenebilir. Önemli değişiklikler web sitemizde 
            duyurulacak ve gerekirse e-posta ile bildirilecektir.
          </p>
        </section>
      </div>
    </div>
  );
}