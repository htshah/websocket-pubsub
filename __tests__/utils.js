export function handleSocketClose({ ws }, wss, done) {
  ws.addEventListener('close', () => {
    wss.close(() => {
      setTimeout(done, 500);
    });
  });
}
