/*---------------------------------------------------------------------------
 * Telif Hakkı/Copyright A. Alper Atıcı. Her Hakkı Saklıdır.
 * All Rights Reserved. This is not free software.
 *---------------------------------------------------------------------------*/
const info_hash = 'dama47f0a059bdaf4651';
const izlemci = 'ws://localhost:8000';
let skt, taydaş, peer_id, ice=[], teklif_yapıldı=false, bağlandı=false, ben_başlarım=false,
    kanal, trackerid;

self.addEventListener('message', e => {
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
      // console.log('soket oluştu.');
      skt.addEventListener('open', async () => {
        // console.log('soket open.');
        taydaş = new RTCPeerConnection({'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]});
        taydaş.addEventListener('signalingstatechange', () => console.log(`signal state: ${taydaş.signalingState}`));
        taydaş.addEventListener('icecandidate', e => {
          if (e.candidate !== null) ice.push(e.candidate);
        });
        taydaş.addEventListener('icegatheringstatechange', () => {
          console.log(`ice state: ${taydaş.iceGatheringState}`);
          if (taydaş.iceGatheringState == 'complete' && !teklif_yapıldı)
            teklif_yap();
        });
        taydaş.addEventListener('connectionstatechange', () => {
          console.log(`conn state: ${taydaş.connectionState}`);
          if (taydaş.connectionState == 'connected') {
            console.log('taydaşlar bağlı.');
            bağlandı = true;
            skt.send(JSON.stringify({event: 'stopped', action: 'announce', peer_id, info_hash}));
            setTimeout(() => skt.close(), 1500);
            postMessage({msg: 'bağlandı', ben_başlarım});
            // teklif_yapıldı = false;
          }
        });

        kanal = taydaş.createDataChannel('dama', {negotiated: true, id: 335});
        await taydaş.createOffer().then(o => taydaş.setLocalDescription(o));

        kanal.addEventListener('message', e => {
          const r = JSON.parse(e.data);
          switch(r.msg) {
            case 'seç-byz':
            case 'seç-syh':
            case 'devindir':
            case 'taş-al':
              postMessage(r);
              break;
          }
        });

      });

      skt.addEventListener('message', e => izlemci_yanıtını_işle(JSON.parse(e.data)));

      skt.addEventListener('error', () => {
        console.log('soket hatası.');
        if (!bağlandı)     // taydaşlar bağlandıktan sonra izlemci soketinin hata verip kapanması sorun değil.
          postMessage({msg: 'soket-hatası'});
      });
      skt.addEventListener('close', () => console.log('soket kapandı.'));

      break;

    case 'kop':
      taydaş?.close();
      ice.length = 0;
      teklif_yapıldı = bağlandı = false;
      skt?.close();
      skt = taydaş = null;
      break;

    case 'seç-byz':          // falls-through
    case 'seç-syh':          // falls-through
    case 'devindir':
    case 'taş-al':
      kanal.send(JSON.stringify(e.data));
      break;
  }
});

function teklif_yap() {
  const m = { event: 'started', action: 'announce', peer_id, info_hash,
              offers: [ {offer_id: crypto.randomUUID().replace(/-/g,''), offer: {sd: taydaş.localDescription, ice}} ] };
  if (trackerid) m.trackerid = trackerid;
  skt.send(JSON.stringify(m));
  teklif_yapıldı = true;
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
    console.log('offer geldi');
    taydaş.setRemoteDescription(new RTCSessionDescription(yn.offer.sd)).then(async () => {
      for (const i of yn.offer.ice)
        await taydaş.addIceCandidate(i);
      taydaş.createAnswer().then(a => taydaş.setLocalDescription(a)).then(() => {
        const m = { action: 'announce', info_hash, peer_id, to_peer_id: yn.peer_id, offer_id: yn.offer_id,
                    answer: { sd: taydaş.localDescription, ice} };
        if (trackerid) m.trackerid = trackerid;
        skt.send(JSON.stringify(m));
      });
    });
    if (teklif_yapıldı)
      // teklif yapmışım, sonra bana teklif gelmiş, demek ki daha erken sisteme giren benim, o halde ben başlarım.
      ben_başlarım = true;
  }
  else if (yn.answer) {
    console.log('answer geldi');
    taydaş.setRemoteDescription(new RTCSessionDescription(yn.answer.sd)).then(async () => {
      for (const i of yn.answer.ice)
        await taydaş.addIceCandidate(i);
    });
  }
  else console.log('izlemci yanıt: '+ JSON.stringify(yn));
}