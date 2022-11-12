let glgth, beyazlar, siyahlar, renk;

self.addEventListener('message', (e) => {
  switch (e.data.msg) {
    case 'oyun-yükle':
      glgth = e.data.glgth;
      beyazlar = e.data.beyazlar;
      siyahlar = e.data.siyahlar;
      renk = e.data.renk;
      break;
    case 'seç-byz':
      renk = 'byz';
      break;
    case 'seç-syh':
      renk = 'syh';
      break;
    case 'aktif':
      if((e.data.sıra == 'beyazda' && renk == 'byz') ||
         (e.data.sıra == 'siyahta' && renk == 'syh'))
         oyna();
      break;
    case 'dur':
      console.log('makina: devredışı.');
      break;
    default:
      console.log('makina: bilinmeyen mesaj geldi.');
  }
});

function oyna() {
  console.log('makina: atılım yaptı.');
}
