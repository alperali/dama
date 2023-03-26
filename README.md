# Dama
Türk dama oyununun `taydaş` dalıdır.

WebRTC kullanarak çevrim içi eşleşme sağlanmıştır.
Sinyalleme için kamuya açık webtorrent izlemcisi, ICE için kamuya açık STUN sunucusu kullanılmıştır (TURN yoktur).
Aynı yerel ağ üzerinde bulunan taydaşlar eşleşerek karşılıklı oynayabilmiş, fakat geniş alan ağlarda eşleşme sağlanamamıştır.
Farklı webtorrent izlemcilerinden alınan yanıtların tam benzeşmediği gözlenmiştir. Webtorrent izlemci protokolünün de halen 
örgün belgelemesi olmadığından bu dal deneysel bir çalışma olarak görülmelidir. Şartların gelişmesi durumunda tekrar ele alınabilir.

---

## Özellikleri
- **PWA (_Progessive Web App_) :**  
  Hem çevrimiçi hem de çevrimdışı çalışabilir.
  Chrome, Edge, Safari, PWA destekli tarayıcı kullanan her platformda çalışır, kurulabilir.
  PWABuilder, Bubblewrap gibi araçlar ile mobil marketlere uygun paketlenip yüklenebilir
  (_Trusted Web Activity(TWA)_ bazlı örnek bir APK _Releases_ altına eklenmiştir).
- **_Responsive_ tasarım:**  
  Telefon, tablet, dizüstü, masaüstü, smartTV, vb her ekran boyutuna uygundur.
- **Temel dama kurallarını uygular:**  
  Taş almak zorunludur. Birden fazla taş alma yolu varsa en fazla taş alınan yolu seçmek zorunludur,
  eşit sayıda taş alma durumunda seçim oyuncuya bırakılır.
  Dama, son taş aldığı yönün tam tersi yönde taş almaya devam edemez. Yapılan hamle geri alınmaz.
- **Temel web teknolojilerine dayanır:**  
  Html, CSS, Javascript, SVG kullanılarak geliştirilmiştir.
  Herhangi bir oyun motoru veya _framework_ kullanmaz, %100 yerlidir.
