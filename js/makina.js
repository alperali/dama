const Taş = { yok: 9, Syh: 13, Byz: 17 };
const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Yağı = {[Yön.Beyaz]: Taş.Syh, [Yön.Siyah]: Taş.Byz};
let glgth, beyazlar, siyahlar, renk, aktif;

self.addEventListener('message', (e) => {
  let taşlar;
  switch (e.data.msg) {
    case 'oyun-yükle':
      glgth = e.data.glgth;
      beyazlar = e.data.beyazlar;
      siyahlar = e.data.siyahlar;
      renk = e.data.makina.renk;
      aktif = e.data.makina.aktif;
      break;
    case 'seç-byz':
      renk = 'byz';
      break;
    case 'seç-syh':
      renk = 'syh';
      break;
    case 'dama-oldu':
      taşlar = e.data.renk == Taş.Byz ? beyazlar : siyahlar;
      for (const t of taşlar)
        if (t.x == e.data.x && t.y == e.data.y) {
          t.dama = 1;
          break;
        }
      break;
    case 'devindir':
      glgth[e.data.to.y][e.data.to.x] = glgth[e.data.y][e.data.x];
      glgth[e.data.y][e.data.x] = Taş.yok;
      taşlar = e.data.yön == Yön.Beyaz ? beyazlar : siyahlar;
      for (const t of taşlar)
        if (t.x == e.data.x && t.y == e.data.y) {
          t.x = e.data.to.x;
          t.y = e.data.to.y;
          break;
        }
      break;
    case 'taş-al':
      glgth[e.data.y][e.data.x] = Taş.yok;
      taşlar = e.data.yön == Yön.Beyaz ? beyazlar : siyahlar;
      for (const [i,t] of taşlar.entries())
        if (t.x == e.data.x && t.y == e.data.y) {
          taşlar.splice(i, 1);
          break;
        }
      break;
    case 'oyna':
      oyna();
      break;
    case 'aktif':
      aktif = 1;
      if((e.data.sıra == 'beyazda' && renk == 'byz') ||
         (e.data.sıra == 'siyahta' && renk == 'syh'))
         oyna();
      break;
    case 'dur':
      aktif = 0;
      console.log('makina: devredışı.');
      break;
    default:
      console.log('makina: bilinmeyen mesaj geldi.');
  }
});

function oyna() {
  console.log('makina: atılım yaptı.');
}
