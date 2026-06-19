# Momentum — Time Management App

CENG318 dersi için, kağıt prototiplerinden (paper prototyping) geliştirilen mobil zaman
yönetimi uygulaması. **Expo (React Native)** ile yazıldı.

## Çalıştırma

```bash
npm install        # bağımlılıklar (ilk seferde)
npm start          # Expo geliştirme sunucusunu başlatır
```

Sonra:
- **Telefonda:** App Store / Play Store'dan **Expo Go** uygulamasını indir, terminaldeki
  QR kodu okut.
- **Android emülatör:** `npm run android`
- **iOS simülatör (sadece macOS):** `npm run ios`
- **Tarayıcı (hızlı önizleme):** `npm run web`

> Giriş ekranında herhangi bir e-posta/şifre ile **Log In** diyebilirsin (prototip olduğu
> için backend yok, veriler cihazda AsyncStorage ile saklanır).

## Ekranlar (prototiplerle birebir)

**Kimlik doğrulama**
- Log In, Sign Up, Forgot Password, Verify Code (6 haneli kod), Reset Password

**Ana akış**
- **Calendar (Main Screen):** Ay/Hafta/Gün/Yıl görünümleri, arama, filtre, görev noktaları,
  TO DO listesi, streak (alev) ikonu, görev ekleme (+)
- **Add Task:** başlık + emoji, açıklama, gün, saat, renk
- **Routines:** günün rutinleri (renkli kartlar), güncel/toplam streak, yeni rutin ekleme
- **Routine Details:** schedule, görevler, ilerleme çubuğu, Edit/Rename/Delete menüsü
- **Add / Edit Routine:** başlık, rutin günleri, saat, renk
- **Puzzle:** rutini tamamlamak için çözülen 8'li kaydırma bulmacası (+1 alev ödülü)
- **Focus Mode:** geri sayım sayacı, hazır odak modları, oynat/duraklat, süre ekle
- **Analytics:** Hafta/Ay/Yıl, streak/tamamlama/alev kartları, çubuk ve çizgi grafikler
- **Streaks:** her rutinin kendi renginde alev rozetiyle streak alt menüsü

**Diğer**
- **Navigation Drawer:** Home, Focus, Routines, Analytics, Settings, Help + profil
- **Settings:** profil, hesap, tercihler (bildirim, **tema – açık/koyu/sistem**, dil,
  saat formatı), veri, çıkış
- **Help:** arama, hızlı başlangıç, SSS (açılır-kapanır), sürüm

## Proje yapısı

```
App.js                      # kök: provider'lar + navigation container
index.js                    # giriş noktası (gesture-handler)
src/
  theme.js                  # renk paletleri (açık/koyu), spacing, radius
  state/AppContext.js       # global state (auth, görev, rutin, streak, tema) + AsyncStorage
  utils/date.js             # takvim/tarih yardımcıları
  components/               # Logo, UI kiti (Button, Input, Card, Header, BottomMenu...)
  navigation/              # RootNavigator + DrawerContent
  screens/                  # tüm ekranlar (auth/ alt klasörü dahil)
```

## Notlar
- Tema (açık/koyu/sistem) Settings'ten değiştirilebilir ve tüm uygulamaya uygulanır.
- Veriler cihazda saklanır; uygulamayı kapatıp açınca korunur.
