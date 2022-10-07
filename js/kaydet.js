self.addEventListener('message', (e) => {
  let yanıt = 'ok';
  try {
    localStorage.setItem('damalper', JSON.stringify(e.data));
  }
  catch(e) {
    yanıt = e.message;
  }
  finally {
    self.postMessage(yanıt);
  }
});