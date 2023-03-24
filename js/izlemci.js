/*---------------------------------------------------------------------------
 * Telif Hakkı/Copyright A. Alper Atıcı. Her Hakkı Saklıdır.
 * All Rights Reserved. This is not free software.
 *---------------------------------------------------------------------------*/
const info_hash = 'dama47f0a059bdaf4651';
const izlemci = 'wss://tracker.files.fm:7073/announce'; // 'ws://localhost:8000'; //
let skt, peer_id, trackerid, taydaşlar_bağlı=false;

self.addEventListener('message', e => {
  let m;
  switch (e.data.msg) {
    case 'bağlan':
      try {
        skt = new WebSocket(izlemci);
      }
      catch(h) {
        console.log(h);
        postMessage({msg: 'izlemci-bağlanma-hatası', neden: h.messsage});
        break;
      }
      peer_id = e.data.id;
      skt.addEventListener('open', () => {
        console.log('soket açıldı.');
        postMessage({msg: 'soket-açıldı'});
      });
      skt.addEventListener('close', () => console.log('soket kapandı.'));
      skt.addEventListener('error', () => {
        if (taydaşlar_bağlı)
          return;    // taydaşlar bağlandıktan sonra izlemci soketinin hata verip kapanması sorun değil.
        postMessage({msg: 'soket-hatası'});
        console.log('soket hatası.');
      });     
      skt.addEventListener('message', e => izlemci_yanıtını_işle(JSON.parse(e.data)));
      break;
    case 'teklif-yap':
      teklif_yap(JSON.parse(e.data.sd), JSON.parse(e.data.ice));
      break;
    case 'yanıt-ver':
      m = { action: 'announce', info_hash, peer_id, to_peer_id: e.data.to_peer_id, offer_id: e.data.offer_id, answer: JSON.parse(e.data.answer) };
      if (trackerid) m.trackerid = trackerid;
      skt.send(JSON.stringify(m));
      break;
    case 'bağlandı':
      taydaşlar_bağlı = true;
      skt.send(JSON.stringify({event: 'stopped', action: 'announce', peer_id, info_hash}));
      setTimeout(() => skt.close(), 1500);
      break;
    case 'kop':
      skt?.close();
      taydaşlar_bağlı = false;
      skt = null;
      break;
    default:
      console.log('izlemci: bilinmeyen mesaj geldi.');
  }
});

function teklif_yap(sd, ice) {
  const m = { event: 'started', action: 'announce', peer_id, info_hash,
              offers: [ {offer_id: crypto.randomUUID().replace(/-/g,''), offer: {sd, ice}} ] };
  if (trackerid) m.trackerid = trackerid;
  skt.send(JSON.stringify(m));
  console.log('teklif gitti.');
}

function izlemci_yanıtını_işle(yn) {
  if (yn.info_hash !== info_hash || yn.peer_id === peer_id)
    return;
  if (yn['failure reason']) {
    console.log(`izlemci hatası: ${yn['failure reason']}`);
    return;
  }
  if (yn['warning message']) {
    console.log(`izlemci uyarısı: ${yn['warning message']}`)
  }
  if (yn['tracker id'])
    trackerid = yn['tracker id'];
  const periyot = yn.interval ?? yn['min interval'];
  // if (periyot)
  //   setInterval()

  if (yn.offer) {
    console.log('teklif geldi');
    postMessage({msg: 'teklif-geldi', yn});
  }
  else if (yn.answer) {
    console.log('yanıt geldi');
    postMessage({msg: 'yanıt-geldi', yn});
  }
  else {
    console.log('izlemci yanıt: '+ JSON.stringify(yn));
    if (+yn.incomplete < 2)
      postMessage({msg: 'oda-boş'});
  }
}