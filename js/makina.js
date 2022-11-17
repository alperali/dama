const Taş = { yok: 9, Syh: 13, Byz: 17 };
const Yön = {B: 0, K: 1, D: 2, G: 3, yok: 4, Beyaz: 1, Siyah: -1 };
const Yağı = {[Yön.Beyaz]: Taş.Syh, [Yön.Siyah]: Taş.Byz};
let glgth, beyazlar, siyahlar;
let yön;

self.addEventListener('message', (e) => {
  let taşlar;
  switch (e.data.msg) {
    case 'oyun-yükle':
      glgth = e.data.glgth;
      beyazlar = e.data.beyazlar;
      siyahlar = e.data.siyahlar;
      yön = e.data.makina.yön;
      // aktif = e.data.makina.aktif;
      break;
    case 'seç-byz':
      yön = Yön.Beyaz;
      break;
    case 'seç-syh':
      yön = Yön.Siyah;
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
      let seçili_alım;
      if (e.data.alan.length) {
        seçili_alım = alım_seç(alan_seç(e.data.seçili_alan, e.data.alan).alım);
        postMessage({msg: 'devindir', 
                     to: { x: seçili_alım.alan_yeni_x, y: seçili_alım.alan_yeni_y}});
      }
      else if (e.data.seçili_alan) {
        seçili_alım = alım_seç(e.data.seçili_alan.alım);
        postMessage({msg: 'devindir', 
                     to: { x: seçili_alım.alan_yeni_x, y: seçili_alım.alan_yeni_y}});
      }
      else
        oyna();
      break;
    case 'dur':
      // aktif = 0;
      console.log('makina: devredışı.');
      break;
    default:
      console.log('makina: bilinmeyen mesaj geldi.');
  }
});

function alan_seç(seçili_alan, alan){
  return seçili_alan;
}

function alım_seç(alım) {
  return alım[0];
}

function oyna() {
  const taşlar = yön == Yön.Beyaz ? beyazlar : siyahlar;

  console.log('makina: atılım yaptı.');
}
